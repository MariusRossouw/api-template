create or replace function job_store_user(init JSON) returns JSON as
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

  var check_job = wf.jobs.store_user;

  if(check_job && check_job.output){
    result = check_job.output;
  }

  var sql = "insert into tb_yodlee_user (login_name, jdata, create_date, create_time, create_display_time) \
  values ($1,$2,$3,$4,$5) returning id;";
  var sqlres = plv8.execute(sql, wf.payload.params.user.loginName, '{}', create_date, create_time, create_display_time);

  wf.job_name = 'yodlee_action';

  wf.payload.user = {};

  wf.payload.user.id = sqlres[0].id;
  wf.payload.jdata = {};

  plv8.ufn.wf_update(wf);
  return {};

$$ LANGUAGE plv8;
