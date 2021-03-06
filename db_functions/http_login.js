create or replace function http_login(http_req_text text) returns JSON as 
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

  if(!http_req.body.email || http_req.body.email.trim().length == 0){
    result.http_code = 403;
    result.message = 'email required';
    return(result);
  };
  if(!http_req.body.password || http_req.body.password.trim().length == 0){
    result.http_code = 403;
    result.message = 'password required';
    return(result);
  };

  var s = "select id, email, first_name, last_name from tb_profile where email = $1 and password = $2;";
  var query_result = plv8.execute(s,http_req.body.email,http_req.body.password);

  if(query_result.length == 0){
    result.http_code = 403;
    result.message = 'invalid email and password';
    return(result);
  };

  result.data = query_result[0];
  result.data.authed = true;
  result.data.navbar = [
    {to:"/projects", description:"Projects"},
    {to:"/users", description:"Users"},
    {to:"/profileDashboard/"+result.data.id, description:result.data.first_name + ' ' +result.data.last_name}
  ];

  return (result);
$$ LANGUAGE plv8;
