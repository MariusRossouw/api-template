create or replace function http_element_add(http_req_text text) returns JSON as
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

    if(!http_req.body.sprint_id ){
        result.http_code = 403;
        result.message = 'sprint_id required';
        return(result);
    };

    var data_obj = {};
    var table_name = 'tb_element';
    var jdata = {};

    data_obj.project_id = http_req.body.project_id;
    data_obj.sprint_id = http_req.body.sprint_id;
    data_obj.element_name = http_req.body.element_name;

    var query_result = plv8.ufn.insert_one(data_obj, table_name);

    var new_id = query_result.id;

    result.data.element_id = new_id.toString();

    return(result);

$$ LANGUAGE plv8;
