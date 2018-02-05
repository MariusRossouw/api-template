create or replace function http_user_update(http_req_text text) returns JSON as
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

  if(!http_req.body.user){
    result.http_code = 403;
    result.message = 'user object required';
    return(result);
  };

  var jdata = {};

  var s_sql = "select * from tb_yodlee_user where id = $1;";
  var s_sqlres = plv8.execute(s_sql, http_req.body.user.id);

  if(s_sqlres.length == 0){
    result.http_code = 403;
    // result.message = 'user not found';
    result.message = s_sql + ' + ' + http_req.body.user.id;
    return result;
  }

  jdata = s_sqlres[0].jdata;

  if(http_req.body.update_token){
    jdata.token = plv8.ufn.generateUUID();
    result.data.token = jdata.token;
  }

  var sql = "update tb_yodlee_user set jdata = $1 where id = $2;"
  var sqlres = plv8.execute(sql, jdata, http_req.body.user.id);

  return (result);

$$ LANGUAGE plv8;
