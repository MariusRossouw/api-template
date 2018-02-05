create or replace function http_3rdparty_authenticate_login(http_req_text text) returns JSON as
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

  if(!http_req.body.login){
    result.http_code = 404;
    result.message = 'login name required';
    return result;
  }

  if(!http_req.body.password){
    result.http_code = 404;
    result.message = 'login password required';
    return result;
  }

  if(!http_req.body.cobSessionToken){
    result.http_code = 404;
    result.message = 'session token required';
    return result;
  }

  var project = plv8.ufn.validate_3rdparty_token(http_req.body.cobSessionToken);

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
        user: {}
      }
    }
  };

  wf.payload.params.user.loginName = http_req.body.login;
  wf.payload.params.user.password = http_req.body.password;
  
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

  var sql = "select * from tb_yodlee_user where login_name = $1;";
  var sqlres = plv8.execute(sql, http_req.body.login);

  if(sqlres.length == 0){
    
    wf.jobs.store_request.next_job = 'store_user';

    wf.payload.new_user = true;
    
    wf.jobs.store_user = {
      type: 'stored_function_json',
      function_name: 'job_store_user',
      input: {},
      add_wf_to_input: true,
      refresh_from_db: true,
      next_job: 'yodlee_action'
    };

  }else{
    wf.payload.user = sqlres[0];
  }

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