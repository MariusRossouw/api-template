create or replace function http_yodlee_log_add(http_req_text text) returns JSON as
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

  if(!http_req.body.status){
    result.http_code = 403;
    result.message = 'status required';
    return(result);
  }

  if(!http_req.body.project_id){
    result.http_code = 403;
    result.message = 'project id required';
    return(result);
  }
  
  // validate project
  var sql = "select id from tb_project where id = $1";
  var sqlres = plv8.execute(sql, http_req.body.project_id);

  if(sqlres.length == 0){
    result.http_code = 404;
    result.message = 'project not found';
    return(result);
  }

  if(!http_req.body.user){
    result.http_code = 403;
    result.message = 'user params required';
    return(result);
  }

  if(!http_req.body.user.id){
    result.http_code = 403;
    result.message = 'user id required';
    return(result);
  }
  
  // validate user
  var sql = "select id from tb_yodlee_user where id = $1";
  var sqlres = plv8.execute(sql, http_req.body.user.id);

  if(sqlres.length == 0){
    result.http_code = 404;
    result.message = 'user not found';
    return(result);
  }

  var jdata = {};

  var md = moment();
  var create_date = md.format("YYYY-MM-DD");
  var create_time = md.format('YYYY-MM-DDTHH:mm:ss');
  var create_display_time = md.format('YYYY-MM-DD HH:mm');

  var sql = "insert into tb_yodlee_log (yodlee_user_id,yodlee_account_id,project_id,request,response,status,jdata,create_date,create_time,create_display_time) \
  values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10);";
  var sqlres = plv8.execute(sql, http_req.body.user.id, http_req.body.account_id, http_req.body.project_id, http_req.body.request, http_req.body.response, http_req.body.status, jdata, create_date, create_time, create_display_time);

  return (result);

$$ LANGUAGE plv8;
