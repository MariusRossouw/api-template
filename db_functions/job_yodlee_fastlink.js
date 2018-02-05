create or replace function job_yodlee_fastlink(init JSON) returns JSON as 
$$
  if(!plv8.ufn){
    var sup = plv8.find_function("plv8_startup");
    sup();
  }

  var result = {};
  var wf = init;

	wf.job_name = '';

  plv8.ufn.wf_update(wf);
  return {};  	

$$ LANGUAGE plv8;

