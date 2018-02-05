create or replace function http_user_project_add(http_req_text text) returns JSON as
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

  if(!http_req.body.user){
    result.http_code = 403;
    result.message = 'user object required';
    return(result);
  };

  if(!http_req.body.user.login_name){
    result.http_code = 403;
    result.message = 'user login name required';
    return(result);
  };
  if(!http_req.body.user.email){
    result.http_code = 403;
    result.message = 'user email required';
    return(result);
  };

  var p_sql = "select id from tb_project where project_name = $1;";
  var p_sqlres = plv8.execute(p_sql, http_req.body.project_name);

  var project_id = p_sqlres[0].id;

  var user_sql = "select id from tb_yodlee_user \
  where login_name = $1 and email = $2;";
  var user_sqlres = plv8.execute(user_sql,http_req.body.user.login_name, http_req.body.user.email);

  if(user_sqlres.length == 0){
    result.http_code = 403;
    result.message = 'user not found';
    return(result);
  }

  var yodlee_user_id = user_sqlres[0].id;

  var sql = "select id from tb_project_user where project_id = $1 and yodlee_user_id = $2;";
  var sqlres = plv8.execute(sql, project_id, yodlee_user_id);

  if(sqlres.length > 0){
    result.http_code = 403;
    result.message = 'user already in project '+http_req.body.project_name;
    return(result);
  }

  var jdata = {};
  jdata.extra_params = http_req.body.extra_params;

  var md = moment();
  var create_date = md.format("YYYY-MM-DD");
  var create_time = md.format('YYYY-MM-DDTHH:mm:ss');
  var create_display_time = md.format('YYYY-MM-DD HH:mm');

  var sql_insert = 'insert into tb_project_user (project_id,yodlee_user_id,jdata,create_date,create_time,create_display_time) \
  values ($1,$2,$3,$4,$5,$6);';
  var query_result = plv8.execute(
    sql_insert, 
    project_id,
    yodlee_user_id,
    jdata,
    create_date,
    create_time,
    create_display_time);

  return (result);

$$ LANGUAGE plv8;
