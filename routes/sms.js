

var async = require('async');
var _ = require('underscore');
var http = require('http');
var querystring = require("querystring");
var moment = require("moment");
var jsesc = require("jsesc");

exports.send_sms = send_sms;
function send_sms(db, cell_number, sms_text, event_type, event_id, entity_id, callback){

  var olog = {
    cell_number: cell_number,
    sms_text: sms_text,
    //_id: ObjectID(),
    event_type: event_type,
    event_id: event_id,
    entity_id: entity_id
  };

  //http://api.clickatell.com/http/sendmsg?user=[USERNAME]&password=[PASSWORD]&api_id=3563970&to=cell_number&text=Message

  var clickatell_qs = {
    "user":"APLtech1",
    "password":"Jando9934667a",
    "api_id":"3563970",
    "to":cell_number,
    "text":sms_text
  };

  var clickatell_options = {
    host: 'api.clickatell.com',
    port: '80',
    path: '/http/sendmsg',
    method: 'GET'
  };

  var httpreq = undefined;
  var httpresbody = '';

  var qs = clickatell_qs;
  qs.to = cell_number;
  qs.text = sms_text;
  var options = clickatell_options;
  options.path = options.path + '?' + querystring.stringify(qs);

  function update_log(result_type,result_err,result_message){
    var u = {
      result_type: result_type,
      result_err: result_err,
      result_message: result_message
    };
    // db.collection('sms_log').update({_id:olog._id},{$set:u},function(err,data){
    //   //do nothing
    // });
  }

  function http_send(callback){
    httpreq = http.request(options,function(httpres){
      console.log(httpres.statusCode);
      //if (httpres.statusCode != 200){
      //    callback({"http_code":httpres.statusCode,"err_code":"api error","dump":{}},{});
      //};
      httpres.on('error',function(err){
        console.error(err);
        //update_log('resp error',err,undefined);
        callback(null,{});
      });
      httpres.on('data',function(chunk){
        httpresbody = httpresbody + chunk;
      });
      httpres.on('end',function(){
        console.log(httpresbody);
        //update_log('resp success',undefined,httpresbody);
        callback(null,{});
      });
    });
    httpreq.on('error',function(err){
      console.error(err);
      //update_log('req error',err,undefined);
      callback(null,{});
    });
    //httpreq.end();
  }

  http_send(function(err,data){
    var r = {data:data};
    r.http_code = 200;
    callback(null,r);
  });

  // async.waterfall([
  //   function(callback) {
  //     //db.collection('sms_log').insert(olog,callback);
  //     callback(null,{});
  //   },
  //   function(data,callback) {
  //     http_send();
  //   }
  // ],
  // function(err,data) {
    
  // });

};


//================ javascript unicode stuff ======================
//unicode=1
//Content-Type: text/xml; charset=utf-8
//echo hex_chars('€'); //20AC 

//https://mathiasbynens.be/notes/javascript-encoding
//https://github.com/bestiejs/punycode.js

//https://mothereff.in/js-escapes#1%F0%9D%8C%86
//https://github.com/mathiasbynens/jsesc

String.prototype.toUnicode = function(){
    var result = "";
    for(var i = 0; i < this.length; i++){
        var partial = this[i].charCodeAt(0).toString(16);
        while(partial.length !== 4) partial = "0" + partial;
        //result += "\\u" + partial;
        result += partial;
    }
    return result;
};
exports.jsescape_cklickatell2 = jsescape_cklickatell2;
function jsescape_cklickatell2(s){
  return s.toUnicode();
}

function escapeRegExp(string) {
    return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}
function replaceAll(string, find, replace) {
  return string.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}
exports.jsescape_clickatell = jsescape_clickatell;
function jsescape_clickatell(s){
  var s_escaped = jsesc(s,{
    'json': true,
    'escapeEverything': true,
    'wrap': false
  });
  s_escaped = replaceAll(s_escaped,'\\u','');
  return s_escaped;
}

//========================================================

exports.cfc_sms = function(){}

// req.pdb, req.body.mobile_number, req.body.message, 'testing', '0', '0', req.body.unicode

exports.send_sms_rest = send_sms_rest;
function send_sms_rest(db, cell_number, sms_text, event_type, event_id, entity_id, unicode, callback){

  var olog = {
    cell_number: cell_number,
    sms_text: sms_text,
    sms_text_unicode: sms_text_unicode,
    //_id: ObjectID(),
    event_type: event_type,
    event_id: event_id,
    entity_id: entity_id
  };

  var post_data = {
    "to": [],
    "text": sms_text
  };
  post_data.to.push(cell_number);

  if(unicode){
    var sms_text_unicode = jsescape_clickatell(sms_text);
    olog.sms_text_unicode = sms_text_unicode;
    post_data.unicode = 1;
    post_data.text = sms_text_unicode;
  }

  console.log(JSON.stringify(post_data));
  var post_data_qs = querystring.stringify(post_data);

  var post_options = {
    host: 'api.clickatell.com',
    port: '80',   //443
    path: '/rest/message',
    method: 'POST',
    headers: {
      'X-Version': '1',
      'Content-Type': 'application/json',
      //'Accept': 'application/json',
      'Authorization': 'bearer Y3ePQJsJ9iqn7C_27iTGZhFRFUPM2zT6SK7WDVLzhReifpTEX2ZjbFmCElUto'//,
      //'Content-Length': Buffer.byteLength(post_data_qs)  //post_data.length
    }
  };

  var httpreq = undefined;
  var httpresbody = '';

  function update_log(result_type,result_err,result_message){
    var u = {
      result_type: result_type,
      result_err: result_err,
      result_message: result_message
    };
    // db.collection('sms_log').update({_id:olog._id},{$set:u},function(err,data){
    //   //do nothing
    // });
  }

  function http_send(callback){
    httpreq = http.request(post_options,function(httpres){
      httpres.setEncoding('utf8');
      console.log(httpres.statusCode);
      //if (httpres.statusCode != 200){
      //    callback({"http_code":httpres.statusCode,"err_code":"api error","dump":{}},{});
      //};
      httpres.on('error',function(err){
        console.error(err);
        update_log('resp error',err,undefined);
        callback(err,{});
      });
      httpres.on('data',function(chunk){
        httpresbody = httpresbody + chunk;
      });
      httpres.on('end',function(){
        console.log(httpresbody);
        //update_log('resp success',undefined,httpresbody);
        callback(null,httpresbody);
      });
    });
    httpreq.on('error',function(err){
      console.error(err);
      //update_log('req error',err,undefined);
      callback(err,{});
    });
    httpreq.write(JSON.stringify(post_data));
    //httpreq.end();
  }
  http_send(function(err,data){
    //we ignore this at this point
  });

  var result = {
    http_code : 200,
    error_code : "",
    message : "",
    data : {},
    errors : []
  };
  callback(null,result);



  // async.waterfall([
  //   function(callback) {
  //     //db.collection('sms_log').insert(olog,callback);
  //     callback(null,{});
  //   },
  //   function(data,callback) {
  //     http_send();
  //   }
  // ],
  // function(err,data) {
    
  // });

};

