create or replace function job_yodlee_action_state_update(init JSON) returns JSON as
$$
  if(!plv8.ufn){
    var sup = plv8.find_function("plv8_startup");
    sup();
  }

  var result = {};
  var wf = init;
  if(!wf.errors){
    wf.errors = [];
  }
  wf.job_name = '';

  var md = moment();
  var create_date = md.format("YYYY-MM-DD");
  var create_time = md.format('YYYY-MM-DDTHH:mm:ss');
  var create_display_time = md.format('YYYY-MM-DD HH:mm');

  var check_job = wf.jobs.yodlee_action;

  var status = '';

  result = wf.result;

  if(result.http_code != 200){
    status = 'failed';
  }else{
    status = 'success';

    if(wf.payload.yodlee_action.code == 'coblogin'){
      wf.payload.project.jdata.cobSession = result.session.cobSession;
      var usql = 'update tb_project set jdata = $1 where id = $2;';
      var usqlres = plv8.execute(usql, wf.payload.project.jdata, wf.payload.project.id);
    }
    if(wf.payload.yodlee_action.code == 'login'){
      wf.payload.user.jdata.userSession = result.user.session.userSession;
      var usql = 'update tb_yodlee_user set jdata = $1 where id = $2;';
      var usqlres = plv8.execute(usql, wf.payload.user.jdata, wf.payload.user.id);
    }
  }

  var sql = "update tb_yodlee_3rdparty_log set status = $1, response = $2 where id = $3;";
  var sqlres = plv8.execute(sql, status, wf.jobs.yodlee_action.output, wf.log_id);

  plv8.ufn.wf_update(wf);
  return {};

$$ LANGUAGE plv8;
