create or replace function http_user_get(http_req_text text) returns JSON as
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

  if(!http_req.body.project_name){
    result.http_code = 403;
    result.message = 'project name required';
    return(result);
  }

  if(!http_req.body.user){
    result.http_code = 403;
    result.message = 'user params required';
    return(result);
  }

  if(!http_req.body.user.login_name){
    result.http_code = 403;
    result.message = 'user login name required';
    return(result);
  }

  if(!http_req.body.user.email){
    result.http_code = 403;
    result.message = 'user email required';
    return(result);
  }

  var sql = "select y.*, p.id project_id, p.project_name, pu.jdata extraParams \
  from tb_yodlee_user y \
  inner join tb_project_user pu on pu.yodlee_user_id = y.id \
  inner join tb_project p on p.id = pu.project_id and p.project_name = $1 \
  where y.login_name = $2";
  var sqlres = plv8.execute(sql, http_req.body.project_name, http_req.body.user.login_name);

  if(sqlres.length == 0){
    result.http_code = 404;
    result.message = 'user not found';
    return(result);
  }

  delete sqlres[0].password;

  var wf = {
    entity_type: 'test',
    entity_id: sqlres[0].id,
    code: 'wf_test',
    jobs: {},
    payload: {}
  };

  // set first job name
  wf.job_name = 'test_name';

  // define job
  wf.jobs.test_name = {
    // wf job name
    type: 'wf_test',
    input: {},
    suppress_error: true
    // add_wf_to_input: true,
    // refresh_from_db: true
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



