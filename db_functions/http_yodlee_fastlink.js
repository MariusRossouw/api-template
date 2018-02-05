create or replace function http_yodlee_fastlink(http_req_text text) returns JSON as
$$

 if(!plv8.ufn){
   var sup = plv8.find_function("plv8_startup");
   sup();
 }

  var result = {
    http_code : 200,
    error_code : "",
    message : "",
    data : {},
    errors : []
  };

  var http_req = plv8.ufn.http_req_parse(http_req_text);
  if(http_req.err_message !== ''){
    result.http_code = 403;
    result.message = http_req.err_message;
    return(result);
  }

  var project_id = 3;

  var wf = {
    entity_type: 'project',
    entity_id: project_id,
    code: 'yodlee_fastlink',
    jobs: {},
    result: {}
  };
  wf.payload = {
    action: 'Yodlee fastlink',
    actor_type: 'project',
    actor_id: project_id,
  }
  wf.jobs.init = {
    type: 'stored_function_json',
    function_name: 'job_yodlee_fastlink',
    add_wf_to_input: true,
    refresh_from_db: true
  };
  wf.job_name = 'init';

  wf.result.data = {};
  wf.result.data.project_id = project_id;

  var myFunction = plv8.find_function("wf_new");
  var wf_id = myFunction(wf);
  
  plv8.ufn.wf_notification(wf_id);   
  var a = result.action = {};
  a.type = 'do_wf';
  a.data = {};
  a.data.wf_id = wf_id;

  result.data = wf;

  return result;

$$ LANGUAGE plv8;



