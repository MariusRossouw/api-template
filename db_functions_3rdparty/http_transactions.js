create or replace function http_transactions(http_req_text text) returns JSON as
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

  // if(!http_req.body.cobrand.cobrandLogin){
  //   result.http_code = 404;
  //   result.message = 'login name required';
  //   return result;
  // }

  // if(!http_req.body.cobrand.cobrandPassword){
  //   result.http_code = 404;
  //   result.message = 'login password required';
  //   return result;
  // }


  // if(!http_req.body.user.loginName){
  //   result.http_code = 404;
  //   result.message = 'login name required';
  //   return result;
  // }

  // if(!http_req.body.user.password){
  //   result.http_code = 404;
  //   result.message = 'login password required';
  //   return result;
  // }

  var project = plv8.ufn.validate_3rdparty_credentials(http_req.body.cobrand.cobrandLogin, http_req.body.cobrand.cobrandPassword);

  if(project.http_code != 200){
    result.http_code = project.http_code;
    result.message = project.message;
    return result;
  }

  var user = plv8.ufn.get_3rdparty_user(http_req.body.user.loginName);

  // TODO : create user if not exists
  if(user.http_code != 200){
    result.http_code = user.http_code;
    result.message = user.message;
    return result;
  }

  var wf = {
    entity_type: 'yodlee',
    entity_id: project.id,
    code: 'transactions',
    jobs: {},
    payload: {
      yodlee_action: {},
      params: {
        user: {}
      }
    }
  };

  wf.payload.user = user;
  wf.payload.project = project;

  // put all options in query params to build url
  wf.payload.yodlee_action.url = project.yodlee_url + '/transactions';
  wf.payload.yodlee_action.code = 'transactions';

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