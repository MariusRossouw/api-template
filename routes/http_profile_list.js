create or replace function http_profile_list(http_req_text text) returns JSON as
$$

  var result = {
    http_code : 200,
    error_code : "",
    message : "",
    data : [],
    errors : []
  };

  var http_req = plv8.ufn.http_req_parse(http_req_text);
  if(http_req.err_message !== ''){
    result.http_code = 403;
    result.message = http_req.err_message;
    return(result);
  }

  var s_profile = "select * from tb_profile";
  plv8.elog(INFO, s_profile);
  var query_result_profile = plv8.execute(s_profile);
  plv8.elog(INFO, query_result_profile);

  result.data = query_result_profile;

  return (result);

$$ LANGUAGE plv8;



