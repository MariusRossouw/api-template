create or replace function job_store_request(init JSON) returns JSON as
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

  var md = moment();
  var create_date = md.format("YYYY-MM-DD");
  var create_time = md.format('YYYY-MM-DDTHH:mm:ss');
  var create_display_time = md.format('YYYY-MM-DD HH:mm');

  var check_job = wf.jobs.store_request;

  if(check_job && check_job.output){
    result = check_job.output;
  }

  var sql = "insert into tb_yodlee_3rdparty_log (project_id, url, request, status, jdata, create_date, create_time, create_display_time, action_code, method) \
  values ($1,$2,$3,$4,$5,$6,$7,$8,$9, $10) returning id;";
  var sqlres = plv8.execute(sql, wf.payload.project.id, wf.payload.yodlee_action.url, wf.payload.params, 'new', '{}', create_date, create_time, create_display_time, wf.payload.yodlee_action.code, wf.payload.method);

  wf.job_name = 'store_user';

  wf.log_id = sqlres[0].id;

  plv8.ufn.wf_update(wf);
  return {};

$$ LANGUAGE plv8;
