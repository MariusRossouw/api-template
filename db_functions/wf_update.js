create or replace function wf_update(wf_obj json) returns JSON as 
$$
  if(!plv8.ufn){
    var sup = plv8.find_function("plv8_startup");
    sup();
  }

  var md = moment();
  var update_date = md.format("YYYY-MM-DD");
  var update_time = md.format('YYYY-MM-DDTHH:mm:ss.SSS');
  var update_display_time = md.format('YYYY-MM-DD HH:mm');

  var sql_req = 'update tb_workflow set wf = $1 where id = $2;';
  var sql_res = plv8.execute(sql_req, wf_obj, wf_obj.id);

  var sql_req = 'insert into tb_workflow_at (wf_id, wf, display_time) values ($1, $2, $3) returning id;';
  var sql_res = plv8.execute(sql_req, wf_obj.id, wf_obj, update_time);
  var new_id = sql_res[0].id;

  return new_id;
$$ LANGUAGE plv8;