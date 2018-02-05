create or replace function http_user_validate_token(http_req_text text) returns JSON as
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

  if(!http_req.body.user.token){
    result.http_code = 403;
    result.message = 'token required';
    return(result);
  }

  var sql = "select profile_id, id, jdata, jdata->'token' token, login_name, password from tb_yodlee_user where jdata->>'token' = $1;";
  var sqlres = plv8.execute(sql, http_req.body.user.token);

  if(sqlres.length == 0){
    result.http_code = 404;
    result.message = 'user token not found';
    return result;
  }

  var jdata = sqlres[0].jdata;
  var id = sqlres[0].id;

  if(sqlres[0].token != http_req.body.user.token){
    result.http_code = 418;
    result.message = 'token invalid';
    return result;
  }

  delete jdata.token;

  var u_sql = "update tb_yodlee_user set jdata = $1 where id = $2;";
  var u_sqlres = plv8.execute(u_sql,jdata,id);

  result.data.profile_id = sqlres[0].profile_id;
  result.data.email = sqlres[0].login_name;
  result.data.password = sqlres[0].password;

  return (result);

$$ LANGUAGE plv8;



