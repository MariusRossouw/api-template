create or replace function http_project_get(http_req_text text) returns JSON as
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

  var sql = "select * from tb_project where project_name = $1";
  var sqlres = plv8.execute(sql, http_req.body.project_name);

  if(sqlres.length == 0){
    result.http_code = 404;
    result.message = 'project not found';
    return(result);
  }


  result.data = sqlres[0];

  return (result);

$$ LANGUAGE plv8;



