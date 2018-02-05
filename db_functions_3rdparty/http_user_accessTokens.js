create or replace function http_user_accessTokens(http_req_text text) returns JSON as
$$

 if(!plv8.ufn){
   var sup = plv8.find_function("plv8_startup");
   sup();
 }

  var result = {
    http_code : 200,
    error_code : "",
    message : "",
    data : {},
    errors : []
  };

  var http_req = plv8.ufn.http_req_parse(http_req_text);
  if(http_req.err_message !== ''){
    result.http_code = 403;
    result.message = http_req.err_message;
    return(result);
  }

  if(!http_req.auth){
    result.http_code = 404;
    result.message = 'auth headers required';
    return result;
  }

  var session_obj = plv8.ufn.get_auth_obj(http_req.auth);

  var project = plv8.ufn.validate_3rdparty_token(session_obj.cobSession);

  if(project.http_code != 200){
    result.http_code = project.http_code;
    result.message = project.message;
    return result;
  }

  var user = plv8.ufn.validate_3rdparty_user(session_obj.userSession);

  if(user.http_code != 200){
    result.http_code = user.http_code;
    result.message = user.message;
    return result;
  }

  var wf = {
    entity_type: 'yodlee',
    entity_id: project.id,
    code: 'accessTokens',
    jobs: {},
    payload: {
      yodlee_action: {},
      session_obj: session_obj
    }
  };
  
  wf.payload.project = project;
  wf.payload.yodlee_action.url = project.yodlee_url + '/user/accessTokens?appIds='+http_req.query.appIds;
  wf.payload.yodlee_action.code = 'accessTokens';

  wf.payload.method = http_req.method;

  // set first job name
  wf.job_name = 'store_request';

  wf.jobs.store_request = {
    type: 'stored_function_json',
    function_name: 'job_store_request',
    input: {},
    add_wf_to_input: true,
    refresh_from_db: true,
    next_job: 'yodlee_action'
  };

  // define job
  wf.jobs.yodlee_action = {
    // wf job name
    type: 'yodlee_action',
    input: {},
    // suppress_error: true,
    add_wf_to_input: true,
    output_to_result_data: true,
    // refresh_from_db: true,
    next_job: 'state_update'
  };

  wf.jobs.state_update = {
    type: 'stored_function_json',
    function_name: 'job_yodlee_action_state_update',
    input: {},
    add_wf_to_input: true
  };

  var myFunction = plv8.find_function("wf_new");
  var new_id = myFunction(wf);
  // plv8.elog(INFO, JSON.stringify(new_id));
  //plv8.ufn.wf_notification(new_id);
  var a = result.action = {};
  a.type = 'do_wf';
  a.data = {};
  a.data.wf_id = new_id;  

  return (result);

$$ LANGUAGE plv8;