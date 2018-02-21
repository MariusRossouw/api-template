create or replace function http_api_method(http_req_text text) returns JSON as
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

  var md = moment();
  var create_date = md.format("YYYY-MM-DD");
  var create_time = md.format('YYYY-MM-DDTHH:mm:ss.SSS');
  var create_display_time = md.format('YYYY-MM-DD HH:mm');

  http_req = {};

  try {
    http_req = JSON.parse(http_req_text);
  } catch(e){
    result.http_code = 403;
    result.error_code = 'json_parse_error';
    result.message = 'Invalid http request';
    log_request();
    return result;
  };
  if(!http_req.query){http_req.query = {}};
  if(!http_req.body){http_req.body = {}};
  if(!http_req.url){http_req.url = ''};

  http_req.create_date = create_date;
  http_req.create_time = create_time;
  http_req.create_display_time = create_display_time;

  var function_name = '';
  var path_array = http_req.url.split('/');
  if(path_array.length > 1){
    function_name = path_array[1];
  }
  var path_array2 = function_name.split('?');
  function_name = path_array2[0];

  result.function_name = function_name;
  if(!function_name || function_name.length == 0){
    result.http_code = 403;
    result.error_code = 'function_name_error';
    result.message = 'Function name error';
    log_request();
    return result;
  };

  if(http_req.api_name && http_req.api_name == '_'){
    function_name = 'http_' + function_name;
  }


  function log_request(){
    var sql = 'insert into tb_api_log (orig_id, type, data, error, create_time, action_type, action_name) values ($1, $2, $3, $4, $5, $6, $7) returning id';
    var sql_res = plv8.execute(sql, 0, 'api', http_req, result.error_code, create_time, 'stored_function', function_name);
    if(sql_res.length > 0 && sql_res[0].id){
      http_req.log_id = sql_res[0].id;
    }
  };
  function log_result(){
    var sql = 'insert into tb_api_log (orig_id, type, data, error, create_time) values ($1, $2, $3, $4, $5)';
    plv8.execute(sql, http_req.log_id, 'api_res', result, result.message, create_time);
  };

  http_req.function_name = function_name;
  log_request();

  var f = null;
  try {
    f = plv8.find_function(function_name);
  } catch (err){
    result.http_code = 403;
    result.error_code = 'function_not_found';
    result.message = 'Function not found';
    log_result();
    return result;
  }

  result = f(JSON.stringify(http_req));
  log_result();
  return result;

$$ LANGUAGE plv8;

