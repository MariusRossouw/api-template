create or replace function http_element_update(http_req_text text) returns JSON as
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

  if (!http_req.body.element_id) {
    result.http_code = 403;
    result.message = 'element_id required';
    return(result);
  };

  var s = "select * from tb_element where id = $1;";
  plv8.elog(INFO, s);
  var query_result = plv8.execute(s,http_req.body.element_id);

  if (query_result.length <= 0) {
    result.http_code = 404;
    result.message = "Element not found - can't update";
    return (result);
  }


  var data_obj = {};
  var data_obj_profile = {};
  var table_name = 'tb_element';

  var params = [
    {field: 'id', value: http_req.body.element_id}
  ];

  // build data_obj
  if (http_req.body.image && http_req.body.image > 0) {
    data_obj.image = http_req.body.image;
  }

  if (http_req.body.element_name && http_req.body.element_name > 0) {
    data_obj.element_name = http_req.body.element_name;
  }

  if (http_req.body.deleted) {
    data_obj.deleted = http_req.body.deleted;
  }
  

  var query_result_element = plv8.ufn.update_one(data_obj, table_name, params);

  return(result); 


$$ LANGUAGE plv8;
