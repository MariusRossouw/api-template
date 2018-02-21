create or replace function http_project_team_list(http_req_text text) returns JSON as
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

    var search = {};

    if (http_req.body.search) {
      search = http_req.body.search;
    }
  
    var offset1 = 0
    if (http_req.body.offset) {
      offset1 = http_req.body.offset;
    };
    var limit1 = 10;
    if (http_req.body.limit) {
      limit1 = http_req.body.limit;
    };
  
    var available_records = 0;
    var count = 0;
    var ex = [];
  
  
    var where = "";
    if ((search.profile_id > 0) ||
        (search.project_id > 0)) {
      where = where + "WHERE ";
      count = 0;
  
      if (search.profile_id > 0) {
        count = count + 1;
        if (count > 1) {
          where = where + "AND ";
        }
        where = where + "pt.id = $" + count.toString() + " ";
        ex.push(search.profile_id);
      }
      if (search.project_id > 0) {
        count = count + 1;
        if (count > 1) {
          where = where + "AND ";
        }
        where = where + "pt.project_id = $" + count.toString() + " ";
        ex.push(search.project_id);
        where = where + " ";
      }
    }
  
    count = count + 1;
    var limit = "order by pt.profile_id \
      limit $" + count.toString() + " ";
  
  
    count = count + 1;
    var offset = "offset $" + count.toString() + " ";
  
    var end = ";";
  
    var inner_j = "join tb_profile prof on pt.profile_id = prof.id \
    join tb_project proj on pt.project_id = proj.id ";
  
    var s_count = "select count(pt.id) cnt from tb_project_team pt " + inner_j + where + end;
  
    var ex1 = [];
    ex1.push(s_count);
    ex1 = ex1.concat(ex);
  
    plv8.elog(INFO, JSON.stringify(ex1));
    var sqlres1 = plv8.execute.apply(this, ex1);
    available_records = sqlres1[0].cnt;
  
    var s_query = " \
    select \
    pt.*, \
    prof.first_name, \
    prof.last_name, \
    prof.image, \
    proj.project_name \
    from tb_project_team pt " + inner_j + where + limit + offset + end;
  
  
    var ex2 = [];
    ex2.push(s_query);
    ex2 = ex2.concat(ex);
    ex2.push(limit1);
    ex2.push(offset1);
  
    plv8.elog(INFO, JSON.stringify(ex2));
    var sqlres = plv8.execute.apply(this, ex2);
    var list = sqlres;
  
  
    result.data.records = list;
    result.data.offset = offset1;
    result.data.limit = limit1;
    result.data.available = available_records;


    return(result);

$$ LANGUAGE plv8;
