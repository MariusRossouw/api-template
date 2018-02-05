create or replace function wf_get(wf_id int) returns JSON as 
$$
  if(!plv8.ufn){
    var sup = plv8.find_function("plv8_startup");
    sup();
  }

  var x = {};

  var sql_req = 'select * from tb_workflow where id = $1;';
  var sql_res = plv8.execute(sql_req, wf_id);
  var wf = sql_res[0];
  wf.wf.id = wf_id;

  return wf;

$$ LANGUAGE plv8;
