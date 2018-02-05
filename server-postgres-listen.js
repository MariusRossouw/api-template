//var fs = require('fs');
//var path = require('path');
var _ = require('underscore');
var async = require('async');
var moment = require('moment');
var nconf = require('nconf');
var pg = require('pg');
var pgp = require('pg-promise')({
    // Initialization Options
});

var utils = require("./includes/utils.js");
var setup = require('./includes/setup.js');

nconf.argv().env();
console.log(JSON.stringify(nconf.get(),null,2));


// -------- Set up connection to do calls to DB --------

var connection_obj = setup.pgp_connection_obj_from_env();
if(!connection_obj.host){
    console.log('db host not found');
    return;
}
var pg_promise_client = pgp(connection_obj);



// -------- Set up connection that listen to DB Notification ----------

var conString = setup.connection_string_from_env();
//normally:  var db_client = new pg.Client(conString);
pg.connect(conString, function(err, db_client) {
  if(err) {
    console.log(err);
    process.exit(0);
  } else {
	  db_client.on('notification', handle_notification);
	  var query = db_client.query("LISTEN yodlee_notification");
    console.log('LISTENing to yodlee_notification');
  }
});


// -------- Here we handle the notifications -------------

function handle_notification(msg){
  if(!msg || !msg.payload){
    return;
  }
  var payload = {};
  try {
    payload = JSON.parse(msg.payload);
  } catch(err) {
    console.log('Notification is not JSON: ' + msg.payload);
    return;
  }  

  console.log('Notification:');
  console.log(JSON.stringify(payload,null,2));

  if(payload.wf){
    utils.do_wf(pg_promise_client, payload.wf.wf_id, function(err, data){
      console.log('WF result:');
      if(err){
        console.error(err);
      }
      if(data){
        console.log(JSON.stringify(data));
      }
      //do nothing further
    });
  }

  if(payload.action){
    utils.do_action(pg_promise_client, payload.action, function(err, data){
      console.log('Action result:');
      if(err){
        console.error(err);
      }
      if(data){
        console.log(JSON.stringify(data));
      }
      //do nothing further
    });
  }

};


/*

IN SQL:
NOTIFY jando_notification, 'any string here'

do language plv8 $$
  var j = {
    action: {
        type:'simple_test',
        name:'',
        data:{label: 'testing a notification'}
    }
  };
  var s = "NOTIFY jando_notification, '" + JSON.stringify(j) + "'";
  //plv8.elog(INFO, s);
  var res = plv8.execute(s);
  //plv8.elog(INFO, res);  //0
$$;

*/



