create or replace function http_3rdparty_authenticate_coblogin(http_req_text text) returns JSON as
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

  if(!http_req.body.cobrandLogin){
    result.http_code = 404;
    result.message = 'login name required';
    return result;
  }

  if(!http_req.body.cobrandPassword){
    result.http_code = 404;
    result.message = 'login password required';
    return result;
  }

  var project = plv8.ufn.validate_3rdparty_credentials(http_req.body.cobrandLogin, http_req.body.cobrandPassword);

  if(project.http_code != 200){
    result.http_code = project.http_code;
    result.message = project.message;
    return result;
  }

  var yodlee_action = plv8.ufn.get_action_code(project,http_req.url);

  result.data.yodlee_action = yodlee_action;

  if(!yodlee_action || yodlee_action.failed){
    result.http_code = 403;
    result.message = 'invalid yodlee call';
    return result;
  }

  var wf = {
    entity_type: 'yodlee',
    entity_id: project.id,
    code: 'coblogin',
    jobs: {},
    payload: {
      params: {
        cobrand: {}
      }
    }
  };

  wf.payload.params.cobrand.cobrandLogin = project.cobrand_login;
  wf.payload.params.cobrand.cobrandPassword = project.cobrand_password;
  
  wf.payload.project = project;
  wf.payload.yodlee_action = yodlee_action;

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