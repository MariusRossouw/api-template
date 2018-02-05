create or replace function http_user_register(http_req_text text) returns JSON as
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


  if(!http_req.body.user.loginName){
    result.http_code = 404;
    result.message = 'login name required';
    return result;
  }

  if(!http_req.body.user.email){
    result.http_code = 404;
    result.message = 'email required';
    return result;
  }

  if(!http_req.body.user.password){
    result.http_code = 404;
    result.message = 'login password required';
    return result;
  }

  var session_obj = plv8.ufn.get_auth_obj(http_req.auth);

  var project = plv8.ufn.validate_3rdparty_token(session_obj.cobSession);

  if(project.http_code != 200){
    result.http_code = project.http_code;
    result.message = project.message;
    return result;
  }

  // TODO : validate user in yodlee DB

  var wf = {
    entity_type: 'yodlee',
    entity_id: project.id,
    code: 'userLogin',
    jobs: {},
    payload: {
      yodlee_action: {},
      params: {
        user:{}
      },
      session_obj: session_obj
    }
  };

  wf.payload.params.user.loginName = http_req.body.user.loginName;
  wf.payload.params.user.password = http_req.body.user.password;
  wf.payload.params.user.email = http_req.body.user.email;
  
  wf.payload.project = project;
  wf.payload.yodlee_action.url = project.yodlee_url + '/user/register';
  wf.payload.yodlee_action.code = 'register';

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

  wf.jobs.state_update = {
    type: 'stored_function_json',
    function_name: 'job_store_user',
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