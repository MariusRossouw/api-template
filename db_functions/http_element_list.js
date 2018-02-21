create or replace function http_element_list(http_req_text text) returns JSON as
$$
  if(!plv8.ufn){
    var sup = plv8.find_function("plv8_startup");
    sup();
  }

  var result = {
    http_code : 200,
    error_code : "",
    message : "",
    data : {
      records: []
    },
    errors : []
  };

  var http_req = plv8.ufn.http_req_parse(http_req_text);
  if(http_req.err_message !== ''){
    result.http_code = 403;
    result.message = http_req.err_message;
    return(result);
  }

  var search = {};

  if(http_req.body.search){
    search = http_req.body.search;
  }

  var offset1 = 0
  if(http_req.body.offset){
    offset1 = http_req.body.offset;
  };
  var limit1 = 1000;
  if(http_req.body.limit){
    limit1 = http_req.body.limit;
  };

  var available_records = 0;
  var count = 0;
  var ex = [];


  var where = "";
  if( (search.element_name  && search.element_name.length > 0 )){
    where = where + "WHERE ";
    count = 0;

    if(search.element_name && search.element_name.length > 0){
        count = count + 1;
        where = where + "(e.element_name ~* $" + count.toString() + " ";
        ex.push(search.element_name);
    }
    if(search.sprint_id && search.sprint_id.length > 0){
        count = count + 1;
        where = where + "(e.sprint_id = $" + count.toString() + " ";
        ex.push(search.sprint_id);
    }
    where = where + " ";
  }
  count = count + 1;
  var limit = "order by e.element_name \
    limit $" + count.toString() + " ";

  count = count + 1;
  var offset = "offset $" + count.toString() + " ";

  var end = ";";

  var s_count = "select count(e.id) cnt from tb_element e " + where + end;

  var ex1 = [];
  ex1.push(s_count);
  ex1 = ex1.concat(ex);

  plv8.elog(INFO, JSON.stringify(ex1));
  var sqlres1 = plv8.execute.apply(this, ex1);
  available_records = sqlres1[0].cnt;

  var s_query = " \
    select \
    e.element_name, \
    e.project_id, \
    e.sprint_id, \
    e.expand, \
    e.image, \
    e.id \
    from tb_element e " + where + limit + offset + end;

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

  return (result);

$$ LANGUAGE plv8;
