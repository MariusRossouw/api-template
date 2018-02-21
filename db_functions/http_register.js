create or replace function http_register(http_req_text text) returns JSON as
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

    var profile_data_obj = {};
    var profile_table_name = 'tb_profile';
    var jdata = {};

    if(!http_req.body.password){
        var password = randomStr(6);
        http_req.body.password = password;
        data_obj.change_password = true;
    }

    function objHasData(obj) {
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
            return true;
        }
    }
        return false;
    }

    function randomStr(n) {
        var n = n || 9; s = '', r = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (var i=0; i < n; i++) { s += r.charAt(Math.floor(Math.random()*r.length)); }
        return s;
    };

    var s = "select * from tb_profile where email = $1;";
    plv8.elog(INFO, s);
    var query_result = plv8.execute(s,http_req.body.email);

    if(query_result.length > 0){
        result.http_code = 403;
        result.message = 'That email is already in use';
        return(result);
    }

    var s1 = "select * from tb_profile where mobile_number = $1;";
    plv8.elog(INFO, s1);
    var query_result1 = plv8.execute(s1,http_req.body.mobile_number);

    if(query_result1.length > 0){
        result.http_code = 403;
        result.message = 'That mobile number is already in use';
        return(result);
    }

    profile_data_obj.first_name = http_req.body.first_name;
    profile_data_obj.last_name = http_req.body.last_name;
    profile_data_obj.password = http_req.body.password;
    profile_data_obj.email = http_req.body.email;
    profile_data_obj.mobile_number = http_req.body.mobile_number;


    var query_result = plv8.ufn.insert_one(profile_data_obj, profile_table_name);

    var new_profile_id = query_result.id;

    result.data.email = http_req.body.email;
    result.data.change_password = profile_data_obj.change_password;
    result.data.profile_id = new_profile_id.toString();

    result.query_result = query_result;
    return(result);

$$ LANGUAGE plv8;



