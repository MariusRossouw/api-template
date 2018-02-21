create or replace function http_project_add(http_req_text text) returns JSON as
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

    var data_obj = {};
    var table_name = 'tb_project';
    var jdata = {};

    data_obj.project_name = http_req.body.project_name;
    data_obj.project_fe_repo_url = http_req.body.project_fe_repo_url;
    data_obj.project_be_repo_url = http_req.body.project_be_repo_url;
    data_obj.project_staging_fe_url = http_req.body.project_staging_fe_url;
    data_obj.project_staging_be_url = http_req.body.project_staging_be_url;
    data_obj.project_staging_db_url = http_req.body.project_staging_db_url;
    data_obj.project_staging_server = http_req.body.project_staging_server;
    data_obj.project_production_fe_url = http_req.body.project_production_fe_url;
    data_obj.project_production_be_url = http_req.body.project_production_be_url;
    data_obj.project_production_db_url = http_req.body.project_production_db_url;
    data_obj.project_production_server = http_req.body.project_production_server;
    data_obj.project_image = http_req.body.project_image;
    data_obj.project_description = http_req.body.project_description;


    var query_result = plv8.ufn.insert_one(data_obj, table_name);

    var new_id = query_result.id;

    result.data.project_id = new_id.toString();

    return(result);

$$ LANGUAGE plv8;
