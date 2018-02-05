create or replace function wf_new(wf_obj json) returns JSON as 
$$
  if(!plv8.ufn){
    var sup = plv8.find_function("plv8_startup");
    sup();
  }

  var md = moment();
  var create_date = md.format("YYYY-MM-DD");
  var create_time = md.format('YYYY-MM-DDTHH:mm:ss.SSS');
  var create_display_time = md.format('YYYY-MM-DD HH:mm');

  if(!wf_obj.counter){
    wf_obj.counter = 0;
  }

  var sql_req = 'insert into tb_workflow (entity_type, entity_id, code, wf, jdata, \
    create_date, create_time, create_display_time) \
    values ($1, $2, $3, $4, $5, $6, $7, $8) returning id;';
  var sql_res = plv8.execute(sql_req, wf_obj.entity_type, wf_obj.entity_id, wf_obj.code, wf_obj, {}, 
    create_date, create_time, create_display_time);
  var new_id1 = sql_res[0].id;

  var sql_req = 'insert into tb_workflow_at (wf_id, wf, display_time) values ($1, $2, $3) returning id;';
  var sql_res = plv8.execute(sql_req, new_id1, wf_obj, create_time);
  var new_id2 = sql_res[0].id;


  return new_id1;
$$ LANGUAGE plv8;

/*
do language plv8 $$
 	var o = {
 		entity_type: 'none',
 		entity_id: 0,
	  code: 'test1',
	  next_job: 'simple_test_1',
	  jobs: {
	    simple_test_1: {
	    	type: 'simple_test',
	    	input: {'type': 'I am testing'},
	    	output_to_result_data: true
			}
		}
	};

	var myFunction = plv8.find_function("wf_new");
  var result = myFunction(o);
	plv8.elog(INFO, JSON.stringify(result));
$$;

curl -i \
-X POST \
-H "Content-Type: application/json" \
-H "Accept: application/json" \
-s http://52.50.7.180:31003/test_action \
-d '{"type":"do_wf", "wf_id":4}'



*/