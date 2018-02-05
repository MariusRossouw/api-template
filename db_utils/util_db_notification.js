(function (root) {
  if(!plv8.ufn){
    return;
  }

  plv8.ufn.action_notification = function(action) {
    var a = {};
    a.action = action;
    var s = "NOTIFY jando_notification, '" + JSON.stringify(a) + "'";
    var res = plv8.execute(s);
  }

  plv8.ufn.wf_notification = function(wf_id) {
    var a = {};
    a.wf = {};
    a.wf.wf_id = wf_id;
    var s = "NOTIFY jando_notification, '" + JSON.stringify(a) + "'";
    var res = plv8.execute(s);
  }

  plv8.ufn.wf_update = function(wf) {
    var sql_req = 'update tb_workflow set wf = $1 where id = $2;';
    var sql_res = plv8.execute(sql_req, wf, wf.id);

    var sql_req = 'insert into tb_workflow_at (wf_id, wf, display_time) values ($1, $2, $3) returning id;';
    var sql_res = plv8.execute(sql_req, wf.id, wf, moment().format('YYYY-MM-DDTHH:mm:ss.SSS'));
    var new_id = sql_res[0].id;
  }


}(this));