var express = require('express');
var http = require('http');
var path = require('path');
var setup = require('./includes/setup.js');
var favicon = require('serve-favicon');
var bodyParser  = require('body-parser');
var methodOverride = require('method-override');
var nconf = require('nconf');
var pgp = require('pg-promise')({
    // Initialization Options
});
var utils = require("./includes/utils.js");

nconf.argv().env();
console.log(JSON.stringify(nconf.get(),null,2));

var port = nconf.get('NODE_SERVER_PORT');
if(!port){
    console.log('port not found');
    return;
}

var connection_obj = setup.pgp_connection_obj_from_env();
if(!connection_obj.host){
    console.log('db host not found');
    return;
}

console.log('Create DB connection object');
var postgress_connection = pgp(connection_obj);

var passInDBPG = function(req, res, next) {
    req.pdb = postgress_connection;
    next();
};

var logreq = function(req, res, next) {
    //log stuff of the request here
    console.log('HEADERS');
    console.log(JSON.stringify(req.headers));
    next();
};

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', true);
    next();
};
var dontcache = function(req, res, next) {
    res.header("Cache-Control", "no-cache, no-store, must-revalidate");
    res.header("Pragma", "no-cache");
    res.header("Expires", 0);
    next();
};

//create express instance and set it up
var app = express();
app.set('port', port);

app.use(favicon(path.join(__dirname,"/favicon.ico")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(methodOverride());
app.use(allowCrossDomain);
app.use(dontcache);
app.use(passInDBPG);
app.use(logreq);



// =============== route to functions =====================

function default_message(req, res){
   res.send(200,"<p>App API</p>");
}
app.get('/', default_message);

// var yodlee = require('./routes/yodlee.js');
// app.post('/api/yodlee_fastlink', yodlee.fast_link);
// app.post('/api/yodlee_fastlink', yodlee.yodlee_fastlink_v2);

// app.post('/api/yodlee_fastlink_test', yodlee.fast_link_test);

// app.post('/api/yodlee_transactions', yodlee.yodlee_transactions);

//API Methods: Lists

// app.post('/authenticate/coblogin', function(req, res){utils.pg_http_gen_new(req, res, '3rdparty');});

app.post('/*', function(req, res){ utils.pg_http_gen_new(req, res, '3rdparty'); });
app.get('/*', function(req, res){ utils.pg_http_gen_new(req, res, '3rdparty'); });

// ============== Start listening ===========================

http.createServer(app).listen(app.get('port'), function(){
  console.log('Yodlee App API listening on port ' + app.get('port'));
});


