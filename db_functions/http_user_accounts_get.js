create or replace function http_user_accounts_get(http_req_text text) returns JSON as
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

  var err = false;
  var get_id = false;

  var project_id = http_req.body.project_id;
  
  if(!http_req.body.project_id && !http_req.body.project_name){
    err = true;
  }
  if(!http_req.body.project_id){
    result.http_code = 403;
    result.message = 'project id required';
  }
  if(!http_req.body.project_name){
    result.http_code = 403;
    result.message = 'project name required';
  }

  if(err){
    return result;
  }

  result.http_code = 200;

  result.message = '';

  if(http_req.body.project_name){
    get_id = true;
  }

  result.data.get_id = get_id;

  if(get_id){
    var sql = "select id from tb_project where project_name = $1;"
    var sqlres = plv8.execute(sql, http_req.body.project_name);
    project_id = sqlres[0].id;
  }

  result.data.project_id = project_id;

  if(!http_req.body.user.id){
    result.http_code = 403;
    result.message = 'yodlee user id required';
    return(result);
  }

  var sql = "select * from tb_account where yodlee_user_id = $1 and project_id = $2";
  var sqlres = plv8.execute(sql, http_req.body.user.id, project_id);

  if(sqlres.length == 0){
    result.http_code = 404;
    result.message = 'accounts not found';
    return(result);
  }

  result.data.accounts = sqlres;

  return (result);

$$ LANGUAGE plv8;



