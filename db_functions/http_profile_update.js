create or replace function http_profile_update(http_req_text text) returns JSON as
$$
if (!plv8.ufn) {
  var sup = plv8.find_function("plv8_startup");
  sup();
 }

  var result = {
    http_code:200,
    message:'',
    data:{}
  };

  var http_req = plv8.ufn.http_req_parse(http_req_text);
  if (http_req.err_message != '') {
    result.http_code = 403;
    result.message = http_req.err_message;
    return(result);
  }

  if (!http_req.body.profile_id) {
    result.http_code = 403;
    result.message = 'Profile ID required';
    return(result);
  };

  var s = "select * from tb_profile where id = $1;";
  plv8.elog(INFO, s);
  var query_result = plv8.execute(s,http_req.body.profile_id);

  if (query_result.length <= 0) {
    result.http_code = 404;
    result.message = "profile does not exist - can't update";
    return (result);
  }


  var data_obj = {};
  // var data_obj_profile = {};
  var table_name = 'tb_profile';

  var params = [
    {field: 'id', value: http_req.body.profile_id}
  ];

  // build data_obj
  if (http_req.body.first_name && http_req.body.first_name.length > 0) {
    data_obj.first_name = http_req.body.first_name;
  }

  if (http_req.body.last_name && http_req.body.last_name.length > 0) {
    data_obj.last_name = http_req.body.last_name;
  }

  if (http_req.body.email && http_req.body.email > 0) {
    data_obj.email = http_req.body.email;
  }

  if (http_req.body.mobile_number && http_req.body.mobile_number > 0) {
    data_obj.mobile_number = http_req.body.mobile_number;
  }

  if (http_req.body.image) {
    data_obj.image = http_req.body.image;
  }

  var query_result_profile = plv8.ufn.update_one(data_obj, table_name, params);
  
  return(result); 

$$ LANGUAGE plv8;
