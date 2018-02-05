create or replace function http_user_add(http_req_text text) returns JSON as
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
  if(!http_req.body.user.password){
    result.http_code = 403;
    result.message = 'user password required';
    return(result);
  };

  var p_sql = "select id from tb_project where project_name = $1;";
  var p_sqlres = plv8.execute(p_sql, http_req.body.project_name);

  var project_id = p_sqlres[0].id;

  var name_sql = "select login_name from tb_yodlee_user y \
  inner join tb_project_user pu on pu.yodlee_user_id = y.id \
  inner join tb_project p on p.id = pu.project_id \
  where lower(login_name) = lower($1) and p.project_name = $2;";
  var name_sqlres = plv8.execute(name_sql,http_req.body.user.login_name,http_req.body.project_name);

  if(name_sqlres.length > 0){
    result.http_code = 403;
    result.message = 'login name already exist';
    return(result);
  }

  var email_sql = "select email from tb_yodlee_user y \
  inner join tb_project_user pu on pu.yodlee_user_id = y.id \
  inner join tb_project p on p.id = pu.project_id \
  where lower(email) = lower($1) and p.project_name = $2;";
  var email_sqlres = plv8.execute(email_sql,http_req.body.user.email,http_req.body.project_name);

  if(email_sqlres.length > 0){
    result.http_code = 403;
    result.message = 'email already exist';
    return(result);
  }

  var md = moment();
  var create_date = md.format("YYYY-MM-DD");
  var create_time = md.format('YYYY-MM-DDTHH:mm:ss');
  var create_display_time = md.format('YYYY-MM-DD HH:mm');

  var jdata = {};
  jdata.extra_params = http_req.body.extra_params;

  var sql_insert = 'insert into tb_yodlee_user (profile_id,email,login_name,password,create_date,create_time,create_display_time,jdata) \
  values ($1,$2,$3,$4,$5,$6,$7,$8) returning id;';
  var query_result = plv8.execute(
    sql_insert, 
    http_req.body.user.profile_id,
    http_req.body.user.email,
    http_req.body.user.login_name,
    http_req.body.user.password,
    create_date,
    create_time,
    create_display_time,
    jdata);
  var new_id = query_result[0].id;

  result.data.user_id = new_id.toString();

  var sql_insert = 'insert into tb_project_user (project_id,yodlee_user_id,jdata,create_date,create_time,create_display_time) \
  values ($1,$2,$3,$4,$5,$6);';
  var query_result = plv8.execute(
    sql_insert, 
    project_id,
    new_id,
    jdata,
    create_date,
    create_time,
    create_display_time);

  result.data.profile_id = http_req.body.user.profile_id ? http_req.body.user.profile_id.toString() : null;

  return (result);

$$ LANGUAGE plv8;
