create or replace function http_sprint_list(http_req_text text) returns JSON as
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

  if(!http_req.body.search.project_id ){
    result.http_code = 403;
    result.message = 'project_id required';
    return(result);
  };

  var search = {};

  if(http_req.body.search){
    search = http_req.body.search;
  }

  var offset1 = 0
  if(http_req.body.offset){
    offset1 = http_req.body.offset;
  };
  var limit1 = 10;
  if(http_req.body.limit){
    limit1 = http_req.body.limit;
  };

  var available_records = 0;
  var count = 0;
  var ex = [];


  var where = "";
  if( (search.project_id  && search.project_id.length > 0 )){
    where = where + "WHERE ";
    count = 0;

    if(search.project_id && search.project_id.length > 0){
        count = count + 1;
        where = where + "s.project_id = $" + count.toString() + " ";
        ex.push(search.project_id);
    }
    where = where + " ";
  }
  count = count + 1;
  var limit = "order by s.sprint_name \
    limit $" + count.toString() + " ";

  count = count + 1;
  var offset = "offset $" + count.toString() + " ";

  var end = ";";

  var s_count = "select count(s.id) cnt from tb_sprint s " + where + end;

  var ex1 = [];
  ex1.push(s_count);
  ex1 = ex1.concat(ex);

  // result.stuff = ex1;

  // return (result);

  plv8.elog(INFO, JSON.stringify(ex1));
  var sqlres1 = plv8.execute.apply(this, ex1);
  available_records = sqlres1[0].cnt;

  var s_query = " \
    select \
    s.* \
    from tb_sprint s " + where + limit + offset + end;

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
