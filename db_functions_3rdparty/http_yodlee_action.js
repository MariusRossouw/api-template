create or replace function http_yodlee_action(http_req_text text) returns JSON as
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

  // if(!http_req.body.project_name){
  //   result.http_code = 403;
  //   result.message = 'project name required';
  //   return(result);
  // }

  // if(!http_req.body.cobrandLogin){
  //   result.http_code = 403;
  //   result.message = 'cobrandLogin required';
  //   return(result);
  // }

  // if(!http_req.body.cobrandPassword){
  //   result.http_code = 403;
  //   result.message = 'cobrandPassword required';
  //   return(result);
  // }

  if(!http_req.body.params){
    result.http_code = 403;
    result.message = 'params required';
    return(result);
  }

  if(!http_req.body.yodlee_url){
    result.http_code = 403;
    result.message = 'yodlee url required';
    return(result);
  }

  if(!http_req.body.yodlee_action_code){
    result.http_code = 403;
    result.message = 'yodlee action required';
    return(result);
  }

  if(!http_req.body.method){
    result.http_code = 403;
    result.message = 'method required';
    return(result);
  }

  var yodlee_action_code = http_req.body.yodlee_action_code;
  var apicred = http_req.body.params.cobrand.cobrandPassword;
  var project_name = http_req.body.params.cobrand.cobrandLogin;

  var sql = "select id, jdata, cobrand_login, cobrand_password  from tb_project where status = $1 and project_name = $2 and apicred = $3;";
  var sqlres = plv8.execute(sql, 'active', project_name, apicred);

  var project = sqlres[0];

  if(sqlres.length == 0){
    result.http_code = 403;
    result.message = 'project not found';
    return(result);
  }

  var project_id = sqlres[0].id;

  var md = moment();
  var create_date = md.format("YYYY-MM-DD");
  var create_time = md.format('YYYY-MM-DDTHH:mm:ss');
  var create_display_time = md.format('YYYY-MM-DD HH:mm');

  /* tb_yodlee_3rdparty_log.status
    1. new
    2. processing
    3. failed/success
  */

  var sql = "insert into tb_yodlee_3rdparty_log (project_id, url, request, status, jdata, create_date, create_time, create_display_time, action_code, method) \
  values ($1,$2,$3,$4,$5,$6,$7,$8,$9, $10) returning id;";
  var sqlres = plv8.execute(sql, project_id, http_req.body.yodlee_url, http_req.body.params, 'new', '{}', create_date, create_time, create_display_time, yodlee_action_code, http_req.body.method);

  var wf = {
    entity_type: 'yodlee',
    entity_id: sqlres[0].id,
    code: yodlee_action_code,
    jobs: {},
    payload: http_req.body
  };

  wf.payload.project = project;

  // set cobrand login from db
  if(yodlee_action_code == 'cobLogin'){
    wf.payload.params.cobrand.cobrandLogin = project.cobrand_login;
    wf.payload.params.cobrand.cobrandPassword = project.cobrand_password;
  }

  // set first job name
  wf.job_name = 'yodlee_action';

  // define job
  wf.jobs.yodlee_action = {
    // wf job name
    type: 'yodlee_action',
    input: {},
    // suppress_error: true,
    add_wf_to_input: true,
    output_to_result_data: true,
    // refresh_from_db: true
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

  result.data = sqlres[0];

  return (result);

$$ LANGUAGE plv8;



