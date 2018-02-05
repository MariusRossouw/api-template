create or replace function http_project_update(http_req_text text) returns JSON as
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

  if(!http_req.body.project_id){
    result.http_code = 403;
    result.message = 'project id required';
    return(result);
  }

  var field_names = [];
  var fields = [];

  if(http_req.body.project_name){
    // Verify that name is not a duplicate
    var sql = "select project_name from tb_project where lower(project_name) = lower($1) and id <> $2;";
    var sqlres = plv8.execute(sql, http_req.body.project_name, http_req.body.project_id);
    if(sqlres.length > 0){
      result.http_code = 403;
      result.message = 'project name already exist';
      return(result);
    }
    fields.push(http_req.body.project_name);
    field_names.push( "project_name");
  };
  if(http_req.body.yodlee_url){
    fields.push(http_req.body.yodlee_url);
    field_names.push("yodlee_url");
  };
  if(http_req.body.cobrand_login){
    fields.push(http_req.body.cobrand_login);
    field_names.push("cobrand_login");
  };
  if(http_req.body.cobrand_password){
    fields.push(http_req.body.cobrand_password);
    field_names.push("cobrand_password");
  };
  if(http_req.body.cobrand_name){
    fields.push(http_req.body.cobrand_name);
    field_names.push("cobrand_name");
  };
  if(http_req.body.app_id){
    fields.push(http_req.body.app_id);
    field_names.push("app_id");
  };
  if(http_req.body.fastlink_url){
    fields.push(http_req.body.fastlink_url);
    field_names.push("fastlink_url");
  };

  if(fields.length == 0 || field_names.length == 0){
    result.message = "nothing to update";
    return result;
  }

  if(fields.length != field_names.length){
    result.message = "field and field_name mismatch";
    return result;
  }

  var s = "update tb_project set ";
  var s_where = " where id = $";

  var i = 0;

  for(i; i < field_names.length; i++){
    s += field_names[i] + " = $" + (i+1) + ",";
  }

  fields.push(http_req.body.project_id);

  s_where += i+1;

  var sql = s.substr(0, s.length - 1) + s_where + ";";
  var sql_vars = [sql].concat(fields);

  plv8.execute.apply(this, sql_vars);

  return (result);

$$ LANGUAGE plv8;



