create or replace function http_project_add(http_req_text text) returns JSON as
$$

 if(!plv8.ufn){
   var sup = plv8.find_function("plv8_startup");
   sup();
 }

var result = {
    http_code:200,
    message:'',
    data:{}
  };

  var http_req = plv8.ufn.http_req_parse(http_req_text);
  if(http_req.err_message != ''){
    result.http_code = 403;
    result.message = http_req.err_message;
    return(result);
  }

  if(!http_req.body.project_name){
    result.http_code = 403;
    result.message = 'project name required';
    return(result);
  };
  if(!http_req.body.yodlee_url || http_req.body.yodlee_url.trim().length == 0){
    result.http_code = 403;
    result.message = 'url required';
    return(result);
  };
  if(!http_req.body.cobrand_login || http_req.body.cobrand_login.trim().length == 0){
    result.http_code = 403;
    result.message = 'cobrand login required';
    return(result);
  };
  if(!http_req.body.cobrand_password || http_req.body.cobrand_password.trim().length == 0){
    result.http_code = 403;
    result.message = 'cobrand password required';
    return(result);
  };
  if(!http_req.body.cobrand_name || http_req.body.cobrand_name.trim().length == 0){
    result.http_code = 403;
    result.message = 'cobrand password required';
    return(result);
  };
  if(!http_req.body.app_id || http_req.body.app_id.trim().length == 0){
    result.http_code = 403;
    result.message = 'cobrand password required';
    return(result);
  };
  if(!http_req.body.fastlink_url || http_req.body.fastlink_url.trim().length == 0){
    result.http_code = 403;
    result.message = 'cobrand password required';
    return(result);
  };

  var s = "select project_name from tb_project where lower(project_name) = lower($1);";
  var query_result = plv8.execute(s,http_req.body.project_name);

  result.data.name = query_result[0];

  if(query_result.length > 0){
    result.http_code = 403;
    result.message = 'project name already exist';
    return(result);
  } 
  var md = moment();
  create_date = md.format("YYYY-MM-DD");
  create_time = md.format('YYYY-MM-DDTHH:mm:ss');
  create_display_time = md.format('YYYY-MM-DD HH:mm');

  var sql_insert = 'insert into tb_project (project_name, cobrand_name, cobrand_login, cobrand_password, yodlee_url, fastlink_url, app_id, create_date, create_time, create_display_time, jdata) \
  values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) returning id;';
  var query_result1 = plv8.execute(
    sql_insert, 
    http_req.body.project_name, 
    http_req.body.cobrand_name, 
    http_req.body.cobrand_login, 
    http_req.body.cobrand_password, 
    http_req.body.yodlee_url, 
    http_req.body.fastlink_url, 
    http_req.body.app_id,  
    create_date, 
    create_time, 
    create_display_time,
    '{}');
  var new_id = query_result1[0].id;

  result.data.project_id = new_id.toString();

  return (result);

$$ LANGUAGE plv8;
