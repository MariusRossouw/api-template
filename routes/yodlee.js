var request = require('request');
var async = require('async');
var _ = require('underscore');
var http = require('http');
var querystring = require("querystring");
var moment = require("moment");

var utils = require("../includes/utils.js");

// req.body example
/*
  {   
    
    "project_name": "CFC",
     
     "user":{
      "loginName":"test@email",
      "password":"P@ssw0rd1"
     }
     
  }
*/

// Get url and cobrand login from project table
// check if user exists
// register and/or login user
// send fastlink iframe as response
// add callback to yodlee service to pull transactions

var result = {
  http_code: 200,
  message: '',
  data: {}
};

var yodlee_obj = {};
yodlee_obj.cobrand = {};
yodlee_obj.user = {};

fastlink_test = function(req, res, callback){
  console.log("fast_link_test");
  callback(null, {});
}

var req_obj = {};

exports.yodlee_fastlink_v2 = function(req, res) {
  console.log('req.body: ' + JSON.stringify(req.body));
  console.log('req.query: ' + JSON.stringify(req.query));
  var req_params_obj = {};
  for (k in req.params) {
    req_params_obj[k] = req.params[k];
  };

  req_obj.params = req_params_obj;
  req_obj.query = req.query;
  req_obj.body = req.body;
  req_obj.headers = req.headers;

  req_obj.other = {};
  req_obj.other.httpVersion = req.httpVersion;
  req_obj.other.method = req.method;
  req_obj.other.rawHeaders = req.rawHeaders;
  req_obj.other.rawTrailers = req.rawTrailers;
  req_obj.other.statusMessage = req.statusMessage;
  req_obj.other.trailers = req.trailers;
  req_obj.other.url = req.url;

  req_obj.other.app = req.app;
  req_obj.other.baseUrl = req.baseUrl;
  req_obj.other.cookies = req.cookies;
  req_obj.other.fresh = req.fresh;
  req_obj.other.hostname = req.hostname;
  req_obj.other.ip = req.ip;
  req_obj.other.ips = req.ips;
  req_obj.other.originalUrl = req.originalUrl;
  req_obj.other.path = req.path;
  req_obj.other.protocol = req.protocol;
  req_obj.other.route = req.route;
  req_obj.other.signedCookies = req.signedCookies;
  req_obj.other.subdomains = req.subdomains;
  req_obj.other.xhr = req.xhr;

  var req_obj_string = JSON.stringify(req_obj, null, 2);

  var result_fin = {
    http_code : 200,
    error_code : "",
    message : "",
    data : {},
    errors : []
  };

  var function1 = 'http_project_get';
  var function2 = 'http_user_get';
  var function3 = 'http_user_add';
  var function4 = 'http_user_update';
  var function5 = 'http_user_project_add';
  var result1 = {};
  var code = {};
  async.waterfall(
    [
      function(callback) {
        try{
          console.log(function1);
          utils.pdb_proc(req.pdb, function1, [req_obj_string], callback);
        }catch(err){
          callback(err, {});
        }
      },
      function(data, callback) {
        console.log('get project');
        result1 = utils.gen_result_check(null,200,data[function1]);
        if(result1.http_code != 200){
          result_fin = result1;
          result.http_code = result1.http_code;
          callback(result1.message, {});
        } else {
          result_fin.data.project_name = result1.data.project_name;
          callback(null, result1.data);
        }
      },
      function(data, callback) {
        yodlee_obj.yodlee_url = data.yodlee_url;
        // yodlee_obj.cobrand.cobrand_name = data.cobrand_name;
        yodlee_obj.cobrand.cobrandLogin = data.cobrand_login;
        yodlee_obj.cobrand.cobrandPassword = data.cobrand_password;
        yodlee_obj.appId = data.app_id;
        yodlee_obj.fastlink_url = data.fastlink_url;

        yodlee_obj.user.loginName = req_obj.body.user.email;
        yodlee_obj.user.password = req_obj.body.user.password;
        yodlee_obj.user.email = req_obj.body.user.email;
        yodlee_obj.extra_params = req.body.extra_params;

        console.log(yodlee_obj);

        callback(null, {});
      },
      function(data, callback){
        console.log('cobrand login');
        cobrand_login(req, res, callback);
      },
      function(data, callback){
        console.log('get user');
        utils.pdb_proc(req.pdb, function2, [req_obj_string], callback);
      },
      function(data, callback){
        result1 = utils.gen_result_check(null,200,data[function2]);
        console.log('result2: ', result1);
        if(result1.http_code != 200){
          console.log('register user');
          register_user(req, res, callback);
        } else {
          yodlee_obj.user.profile_id = result1.data.profile_id;
          yodlee_obj.user.yodlee_user_id = result1.data.id;

          console.log('user found');
          callback(null, result1);
        }
      },
      function(data, callback){
        if(data.data.register_user == 'skip'){
          console.log('store user project');
          callback(null,'new_project');
        }else if(data.data.register_user == 'success'){
          console.log('store user');
          utils.pdb_proc(req.pdb, function3, [req_obj_string], callback);
        } else{
          console.log('skip user store');
          callback(null,'skip');
        }
      },
      function(data,callback){
        if(data == 'skip'){
          callback(null,'skip');
        }else if(data == 'new_project'){
          console.log('store user project');
          utils.pdb_proc(req.pdb, function5, [req_obj_string], callback);
        }
      },
      function(data,callback){
        if(data == 'skip'){
          callback(null, 'skip');
        }else{
          result1 = utils.gen_result_check(null,200,data[function5]);
          console.log('result5: ', result1);
          if(result1.http_code != 200){
            console.log('store user project: failed');
            callback(result1.message,{});
          }else{
            callback(null, 'skip');
          }
        }
      },
      function(data, callback){
        if(data == 'skip'){
          callback(null,{});
        }else{
          result1 = utils.gen_result_check(null,200,data[function3]);
          console.log('result3: ', result1);
          if(result1.http_code != 200){
            console.log('store user: failed');
            callback(result1.message, {});
          } else {
            console.log('store user: success');
            yodlee_obj.user.profile_id = result1.data.profile_id;
            yodlee_obj.user.yodlee_user_id = result1.data.user_id;
            callback(null, result1.data);
          }
        }
      },
      function(data, callback){
        var temp_req_obj = req_obj;
        temp_req_obj.body.user.profile_id = yodlee_obj.user.profile_id;
        temp_req_obj.body.user.id = yodlee_obj.user.yodlee_user_id;
        temp_req_obj.body.update_token = true;
        temp_req_obj_string = JSON.stringify(temp_req_obj, null, 2);
        utils.pdb_proc(req.pdb, function4, [temp_req_obj_string], callback);
      },
      function(data,callback){
        console.log('store validation token');
        result1 = utils.gen_result_check(null,200,data[function4]);
        console.log('result4: ', result1);
        if(result1.http_code != 200){
          result_fin = result1;
          result.http_code = result1.http_code;
          callback(result1.message, {});
        } else {
          yodlee_obj.validation_token = result1.data.token;
          callback(null, result1.data);
        }
      },
      function(data, callback){
        console.log('user login');
        result.message = '';
        user_login(req, res, callback);
      },
      function(data, callback){
        console.log('access tokens');
        get_access_tokens(req, res, callback);
      },
      function(data, callback){
        console.log('get fast link details');
        get_fast_link_details(req, res, callback);
      },
      function(data, callback){
        console.log(data);
        yodlee_obj.fastlink_details = data;
        callback(null, {});
      }
      // ,
      // function(data, callback){
      //   console.log('send fastlink');
      //   send_fastlink_html(req, res, callback);
      // }
    ],
    function(err, data) {
      result_fin.http_code = result.http_code;
      result_fin.message = result.message;
      result_fin.data = result.data;
      if(err){
        console.log("Error: " + JSON.stringify(err));
        if(result1.http_code == 200){
          result_fin.http_code = 500;
        }
        result_fin.message = err;
        result_fin.errors = result1.errors;
        utils.gen_result(res, null, 500, result_fin);
      }else{
        console.log("success");
        result_fin.data = result.data;
        result_fin.data.yodlee_obj = yodlee_obj;
        utils.gen_result(res, null, 200, result_fin);
      }
    }
  );
};

cobrand_login = function(req, res, callback) {
  console.log('cobrand login...');
  var cobrand = yodlee_obj.cobrand;
  console.log('COBRAND: ', cobrand);
  var options = {
    url: yodlee_obj.yodlee_url + '/cobrand/login',
    method: 'POST',
    headers: {
      'User-Agent': 'Mozilla/5.0',
      'Content-Type': 'application/json; charset=utf-8'
    },
    json: {
      cobrand
    }
  }

  console.log('COBRAND OPTIONS',options);

  request(options, function(error, response, body) {
    console.log('cobBody', JSON.stringify(body));
    console.log('cobResponse', JSON.stringify(response));
    if(body.errorCode){
      console.log('cobrand login: failed');
      result.data.cobrand_login = 'failed';
      result.http_code = 403;
      result.message = body.errorMessage;
      callback(body.errorMessage, result);
    }else{
      console.log('cobrand login: success');
      yodlee_obj.cobrand_session = body.session.cobSession;
      result.data.cobrand_login = 'success';
      result.http_code = 200;
      callback(null, result);
    }
  });
};

register_user = function(req, res, callback) {
  console.log('register user...');
  var user = yodlee_obj.user;
  console.log('REGISTER: ', user);
  var session_string = "{cobSession=" + yodlee_obj.cobrand_session + "}";
  var options = {
    url: yodlee_obj.yodlee_url + '/user/register',
    method: 'POST',
    headers: {
      'Authorization': session_string
    },
    json: {user: user}
  }

  console.log('REGISTER OPTIONS',JSON.stringify(options));

  request(options, function(err, response, body) {
    if(err){
      console.log(err);
      callback(err, {});
    }
    console.log('regBody', JSON.stringify(body));
    console.log('regResponse', response.statusCode);
    console.log('errorMessage:', response.errorMessage);
    if(response.statusCode != 200){
      console.log('STATUS:', response.statusCode);
      console.log('register user: failed');
      result.data.register_user = 'failed';
      result.http_code = response.statusCode;
      result.message = response.errorMessage;
      if(body.errorCode == 'Y400'){
        result.data.register_user = 'skip';
        callback(null, result);
      }else{
        callback(body.errorMessage, result);
      }
    }else{
      console.log('register user: success');
      yodlee_obj.user_session = body.user.session.userSession;
      result.data.register_user = 'success';
      result.http_code = 200;
      callback(null, result);
    }
  });
};

user_login = function(req, res, callback) {
  console.log('user login...');
  var user = yodlee_obj.user;
  var session_string = "{cobSession=" + yodlee_obj.cobrand_session + "}";
  var options = {
    url: yodlee_obj.yodlee_url + '/user/login',
    method: 'POST',
    headers: {
      'User-Agent': 'Mozilla/5.0',
      'Content-Type': 'application/json; charset=utf-8',
      'Authorization': session_string
    },
    json: {
      user
    }
  }

  request(options, function(error, response, body) {
    console.log('loginBody', JSON.stringify(body));
    console.log('loginResponse', JSON.stringify(response));
    console.log('loginError', JSON.stringify(error));
    if(body.errorCode){
      console.log('user login: failed');
      result.data.user_login = 'failed';
      result.http_code = 403;
      result.message = body.errorMessage;
      callback(body.errorMessage, result);
    }else{
      console.log('user login: success');
      result.data.user_login = 'success';
      yodlee_obj.user_session = body.user.session.userSession;
      result.http_code = 200;
      callback(null, result);
    }
  });
};

get_access_tokens = function(req, res, callback) {
  console.log('get access tokens...');
  var user = yodlee_obj.user;
  var session_string = "{cobSession=" + yodlee_obj.cobrand_session + ",userSession=" + yodlee_obj.user_session + "}";
  var options = {
    url: yodlee_obj.yodlee_url + '/user/accessTokens?appIds='+yodlee_obj.appId,
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0',
      'Content-Type': 'application/json; charset=utf-8',
      'Authorization': session_string
    },
    json: {
      user
    }
  }

  request(options, function(error, response, body) {
    console.log('accessTokensBody', JSON.stringify(body));
    if(body.errorCode){
      console.log('get access tokens: failed');
      result.data.access_tokens = 'failed';
      result.http_code = 403;
      result.message = body.errorMessage;
      callback(body.errorMessage, result);
    }else{
      console.log('get access tokens: success');
      result.data.access_tokens = 'success';
      yodlee_obj.access_tokens = body.user.accessTokens;
      result.http_code = 200;
      callback(null, result);
    }
  });
};

send_fastlink_html = function(req, res, callback){
  console.log('send fastlink...');
  var html = '<!DOCTYPE html>\
    <html>\
        <body>\
            <form action=\"\" method=\"POST\">\
              <input type=\"text\" name=\"app\" value=\"'+ yodlee_obj.fastlink_details.app +'\" />\
              <input type=\"text\" name=\"rsession\" value=\"' + yodlee_obj.fastlink_details.rsession + '\" />\
              <input type=\"text\" name=\"token\" value=\"' + yodlee_obj.fastlink_details.token + '\" />\
              <input type=\"text\" name=\"redirectReq\" value=\"true\"/>\
              <input type=\"text\" name=\"extraParams\" value=\"'+ yodlee_obj.fastlink_details.extra_params +'\"/>\
              <input type=\"submit\" name=\"submit\" />\
            </form>\
        </body>\
    </html>';
  var options = {
    url: yodlee_obj.fastlink_details.actionUrl,
    method: 'POST',
    headers: {
      'Content-Type': 'text/html'
    },
    body: {
      html
    }
  }

  request(options, function(err, response, body) {
    console.log('fastlink', JSON.stringify(body));
    if(body.errorCode){
      console.log('fastlink redirect: failed');
      result.data.fastlink = 'failed';
      result.http_code = 403;
      result.message = body.errorMessage;
      callback(body.errorMessage, result);
    }else{
      console.log('get access tokens: success');
      result.data.fastlink = 'success';
      result.http_code = 200;
      callback(null, result);
    }
  });
}

// get actionUrl from project
// get appId from project
get_fast_link_details = function(req, res, callback) {
  console.log('create fastlink...');

  var token = null;
  for (var i = 0; i < yodlee_obj.access_tokens.length; i++) {
    if (yodlee_obj.access_tokens[i].appId === yodlee_obj.appId) {
      token = yodlee_obj.access_tokens[i].value;
      break;
    }
  }

  var extra_params = '';

  if(yodlee_obj.extra_params){
    if(yodlee_obj.extra_params.keyword){
      extra_params += 'keyword=' + yodlee_obj.extra_params.keyword + '&';
    }
  }

  // TODO: get extraParams from tb_project_user
  if(req.body.project_name == 'cfc' || req.body.project_name == 'cfc_stage'){
    extra_params += "callback=http://cfc.memberbase.net/#/monthly-overdraft?token="+yodlee_obj.validation_token;
  }

  var details = {
    actionUrl: yodlee_obj.fastlink_url,
    app: yodlee_obj.appId,
    rsession: yodlee_obj.user_session,
    token: token,
    redirectReq: true,
    extraParams: extra_params,
  };

  callback(null, details);
};

exports.yodlee_transactions = function(req, res){
  console.log('yodlee_transactions_body', req.body);
  console.log('req.query: ' + JSON.stringify(req.query));
  var req_params_obj = {};
  for (k in req.params) {
    req_params_obj[k] = req.params[k];
  };

  req_obj.params = req_params_obj;
  req_obj.query = req.query;
  req_obj.body = req.body;
  req_obj.headers = req.headers;

  req_obj.other = {};
  req_obj.other.httpVersion = req.httpVersion;
  req_obj.other.method = req.method;
  req_obj.other.rawHeaders = req.rawHeaders;
  req_obj.other.rawTrailers = req.rawTrailers;
  req_obj.other.statusMessage = req.statusMessage;
  req_obj.other.trailers = req.trailers;
  req_obj.other.url = req.url;

  req_obj.other.app = req.app;
  req_obj.other.baseUrl = req.baseUrl;
  req_obj.other.cookies = req.cookies;
  req_obj.other.fresh = req.fresh;
  req_obj.other.hostname = req.hostname;
  req_obj.other.ip = req.ip;
  req_obj.other.ips = req.ips;
  req_obj.other.originalUrl = req.originalUrl;
  req_obj.other.path = req.path;
  req_obj.other.protocol = req.protocol;
  req_obj.other.route = req.route;
  req_obj.other.signedCookies = req.signedCookies;
  req_obj.other.subdomains = req.subdomains;
  req_obj.other.xhr = req.xhr;

  var req_obj_string = JSON.stringify(req_obj, null, 2);

  var result_fin = {
    http_code : 200,
    error_code : "",
    message : "",
    data : {},
    errors : []
  };
  var function1 = 'http_project_get';
  var function2 = 'http_user_get';
  var function3 = 'http_account_add';
  var function4 = 'http_transaction_add';

  async.waterfall(
    [
      function(callback){
        try{
          console.log(function1);
          utils.pdb_proc(req.pdb, function1, [req_obj_string], callback);
        }catch(err){
          callback(err, {});
        }
      },
      function(data,callback){
        console.log('get project');
        result1 = utils.gen_result_check(null,200,data[function1]);
        if(result1.http_code != 200){
          result_fin = result1;
          result.http_code = result1.http_code;
          callback(result1.message, {});
        } else {
          result_fin.data.project_name = result1.data.project_name;
          yodlee_obj.project_id = result1.data.id;
          callback(null, result1.data);
        }
      },
      function(data,callback){
        yodlee_obj.yodlee_url = data.yodlee_url;
        // yodlee_obj.cobrand.cobrand_name = data.cobrand_name;
        yodlee_obj.cobrand.cobrandLogin = data.cobrand_login;
        yodlee_obj.cobrand.cobrandPassword = data.cobrand_password;
        yodlee_obj.appId = data.app_id;
        yodlee_obj.fastlink_url = data.fastlink_url;

        yodlee_obj.user.loginName = req_obj.body.user.email;
        yodlee_obj.user.email = req_obj.body.user.email;
        yodlee_obj.extra_params = req.body.extra_params;

        console.log(yodlee_obj);

        callback(null, {});
      },
      function(data, callback){
        console.log('cobrand login');
        cobrand_login(req, res, callback);
      },
      function(data, callback){
        console.log('get user');
        utils.pdb_proc(req.pdb, function2, [req_obj_string], callback);
      },
      function(data, callback){
        result1 = utils.gen_result_check(null,200,data[function2]);
        // console.log('result2: ', result1);
        if(result1.http_code != 200){
          console.log('register user');
          callback(result1.message,{});
        } else {
          yodlee_obj.user.profile_id = result1.data.profile_id;
          yodlee_obj.user.yodlee_user_id = result1.data.id;
          yodlee_obj.user.password = req.body.user.password;

          console.log('user found');
          callback(null, result1);
        }
      },
      function(data, callback){
        console.log('user login');
        result.message = '';
        user_login(req, res, callback);
      },
      // bank account
      function(data,callback){
        console.log('get accounts');
        result.message = '';
        get_accounts(req,res,callback);
      },
      function(data,callback){
        console.log('store accounts');
        var temp_req_obj = req_obj;
        temp_req_obj.body.user.id = yodlee_obj.user.yodlee_user_id;
        temp_req_obj.body.accounts = yodlee_obj.accounts;
        temp_req_obj.body.project_id = yodlee_obj.project_id;
        temp_req_obj_string = JSON.stringify(temp_req_obj, null, 2);
        utils.pdb_proc(req.pdb, function3, [temp_req_obj_string], callback);
      },
      function(data,callback){
        console.log('store accounts');
        result1 = utils.gen_result_check(null,200,data[function3]);
        // console.log('result3: ', result1);
        if(result1.http_code != 200){
          result_fin = result1;
          result.http_code = result1.http_code;
          callback(result1.message, {});
        } else {
          callback(null, result1.data);
        }
      },
      // get overdraft and store
      // function(data,callback){
      //   console.log('OVERDRAFT', yodlee_obj.accounts);
      //   // loop start
      //   async.forEachSeries(yodlee_obj.accounts, function (account, callback){
      //     // waterfall start
      //     async.waterfall(
      //     [
      //       function(callback){
      //         console.log('get account overdrafts');
      //         get_account_overdraft(req,res,account.providerAccountId,callback);
      //       },
      //       function(data,callback){
      //         console.log('store account overdrafts');
      //         console.log('OVERDRAFT: ',data);
      //         yodlee_obj.overdraft = data;
      //       }
      //     ], 
      //       function(err,data){
      //         if(err){
      //           console.log('overdraft err', err);
      //           callback('overdraft fetch err', {});
      //         }else{
      //           result.http_code = 200;
      //           result.message = '';
      //           callback();
      //         }
      //     });
      //     // waterfall end
      //   },
      //   function (err) {
      //     if(err){
      //       callback(err, {});
      //     }else{
      //       callback(null, {});
      //     }
      //   });
      //   // loop end
      // },
      // transactions
      function(data,callback){
        console.log('get transactions');
        result.message = '';
        get_transactions(req,res,callback);
      },
      function(data,callback){
        console.log('store transactions');
        var temp_req_obj = req_obj;
        temp_req_obj.body.user.id = yodlee_obj.user.yodlee_user_id;
        temp_req_obj.body.transactions = yodlee_obj.transactions;
        temp_req_obj.body.project_id = yodlee_obj.project_id;
        temp_req_obj_string = JSON.stringify(temp_req_obj, null, 2);
        utils.pdb_proc(req.pdb, function4, [temp_req_obj_string], callback);
      },
      function(data,callback){
        console.log('store transactions');
        result1 = utils.gen_result_check(null,200,data[function4]);
        // console.log('result4: ', result1);
        if(result1.http_code != 200){
          result_fin = result1;
          result.http_code = result1.http_code;
          callback(result1.message, {});
        } else {
          callback(null, result1.data);
        }
      }
    ],
    function(err,data){
      result_fin.http_code = result.http_code;
      result_fin.message = result.message;
      result_fin.data = result.data;
      delete yodlee_obj.transactions;
      delete yodlee_obj.accounts;
      if(err){
        yodlee_obj.status = 'failed';
        console.log("Error: " + JSON.stringify(err));
        if(result1.http_code == 200){
          result_fin.http_code = 500;
        }
        result_fin.message = err;
        result_fin.errors = result1.errors;
  
        utils.gen_result(res, null, 500, result_fin);
      }else{
        console.log("success");
        yodlee_obj.status = 'success';
        result_fin.data = result.data;
        result_fin.data.yodlee_obj = yodlee_obj;
        utils.gen_result(res, null, 200, result_fin);
      }
      log_transaction(req,res);
    }
  );
};

log_transaction = function(req,res){
  console.log('log...');
  req_obj.body.user.id = yodlee_obj.user.yodlee_user_id;
  req_obj.body.project_id = yodlee_obj.project_id;
  req_obj.body.response = result;
  req_obj.body.status = yodlee_obj.status;
  console.log('req_obj: ', req_obj.body);
  var function_name = 'http_yodlee_log_add';
  var req_obj_string = JSON.stringify(req_obj, null, 2);
  utils.pdb_proc(req.pdb, function_name, [req_obj_string], function(err,data){
    console.log('log in: ', data);
    var result_log = utils.gen_result_check(null,200,data[function_name]);
    console.log('result log: ', result_log);
    console.log('log end');
  });
}

get_accounts = function(req, res, callback) {
  console.log('get bank account...');
  var user = yodlee_obj.user;
  var partial = '/accounts';

  if(req.body.account_id){
    partial += '/'+req.body.account_id;
  }

  var session_string = "{cobSession=" + yodlee_obj.cobrand_session + ",userSession=" + yodlee_obj.user_session + "}";
  var options = {
    url: yodlee_obj.yodlee_url + partial,
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0',
      'Content-Type': 'application/json; charset=utf-8',
      'Authorization': session_string
    },
    json: {
      user
    }
  }

  request(options, function(error, response, body) {
    console.log('accountsBody', JSON.stringify(body));
    if(body.errorCode){
      console.log('get accounts: failed');
      result.data.transactions = 'failed';
      result.http_code = 403;
      result.message = body.errorMessage;
      callback(body.errorMessage, result);
    }else{
      console.log('get accounts: success');
      result.data.accounts = 'success';
      yodlee_obj.accounts = body.account;
      result.http_code = 200;
      callback(null, result);
    }
  });
};

get_account_overdraft = function(req, res, account_id, callback) {
  console.log('get bank account overdraft...');
  var user = yodlee_obj.user;
  user.container = 'bank';
  var partial = '/accounts';

  var session_string = "{cobSession=" + yodlee_obj.cobrand_session + ",userSession=" + yodlee_obj.user_session + "}";
  var options = {
    url: yodlee_obj.yodlee_url + partial + '?providerAccountId=' + account_id,
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0',
      'Content-Type': 'application/json; charset=utf-8',
      'Authorization': session_string
    },
    json: {
      user
    }
  }

  request(options, function(error, response, body) {
    console.log('overdraftBody', JSON.stringify(body));
    if(body.errorCode){
      console.log('get accounts overdraft: failed');
      result.data.transactions = 'failed';
      result.http_code = 403;
      result.message = body.errorMessage;
      callback(body.errorMessage, result);
    }else{
      console.log('get accounts overdraft: success');
      result.data.accounts = 'success';
      yodlee_obj.account_overdraft = body.account;
      result.http_code = 200;
      callback(null, result);
    }
  });
};

get_transactions = function(req, res, callback) {
  console.log('get transactions...');
  var user = yodlee_obj.user;

  var account_id = '';

  if(req.body.account_id){
    account_id = '&accountId=' + req.body.account_id;
  }

  var md = moment();
  var to_date = md.format("YYYY-MM-DD");
  var from_date = moment().subtract(90, 'days').format("YYYY-MM-DD");

  console.log('from_date', from_date);
  console.log('to_date', to_date);
  var session_string = "{cobSession=" + yodlee_obj.cobrand_session + ",userSession=" + yodlee_obj.user_session + "}";
  var options = {
    url: yodlee_obj.yodlee_url + '/transactions?fromDate='+from_date+'&toDate='+to_date+account_id,
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0',
      'Content-Type': 'application/json; charset=utf-8',
      'Authorization': session_string
    },
    json: {
      user
    }
  }

  request(options, function(error, response, body) {
    // console.log('transactionsBody', JSON.stringify(body));
    if(body.errorCode){
      console.log('get transactions: failed');
      result.data.transactions = 'failed';
      result.http_code = 403;
      result.message = body.errorMessage;
      callback(body.errorMessage, result);
    }else{
      console.log('get transactions: success');
      result.data.transactions = 'success';
      yodlee_obj.transactions = body.transaction;
      result.http_code = 200;
      callback(null, result);
    }
  });
};

//  OLD

getTransactions = function(req, res, cobrandSession, userSession, callback) {
    console.log('cobrandSession',JSON.stringify(cobrandSession));
    console.log('userSession',JSON.stringify(userSession));

    var query_json = JSON.parse(req.query.JSONcallBackStatus);

    console.log('query_json',query_json);
    // var todate = new Date().toISOString();
    // var fromdate = new Date().toISOString();
    // fromdate.setMonth(todate.getMonth()-3);

    // console.log('fromdate: ', fromdate);
    // console.log('todate: ', todate);

    var sessionString = "{cobSession=" + cobrandSession.cobSession + ",userSession=" + userSession.userSession + "}";
    var options = {
        // url: 'https://developer.api.yodlee.com/ysl/restserver/v1/transactions?fromDate='+ fromdate +'&toDate='+ todate,
        url: 'https://developer.api.yodlee.com/ysl/restserver/v1/transactions?accountId='+ query_json[0].providerAccountId ,//?accountId='+ query_json[0].providerAccountId,
        url: base_url + '/transactions?accountId='+ query_json[0].providerAccountId ,//?accountId='+ query_json[0].providerAccountId,
        method: 'GET',
        headers: {
            'User-Agent': 'Mozilla/5.0',
      	    'Content-Type': 'application/json; charset=utf-8',
            'Authorization': sessionString
      			//'Content-Type':'text/plain;charset=UTF-8'
      			//'Content-Type' : 'application/x-www-form-urlencoded' 
        },
        form:  '',
        json: {
            "user": {
                "loginName": "sbMemjaco.davel@gmail.com1",
                "password": "sbMemjaco.davel@gmail.com1#123",
                "locale": "en_US"
            }
        }
    }

    console.log(options);

    request(options, function(error, response, body) {

        var transactions = [];
        for (var i = 0; i < body.transaction.length; i++) {
            var transaction = {
                transactionId: body.transaction[i].id,
                balance: body.transaction[i].balance,
                transactionDate: body.transaction[i].transactionDate,
                description1: body.transaction[i].description.original,
                description2: body.transaction[i].description.consumer,
                accountId: body.transaction[i].accountId
            }

            if (body.transaction[i].baseType === 'DEBIT') {
                transaction.debit = body.transaction[i].amount.amount;
                transaction.credit = 0;
            } else {
                transaction.debit = 0;
                transaction.credit = body.transaction[i].amount.amount;
            }

            transactions.push(transaction);
            break;
        }

        // console.log(JSON.stringify({ transactions: transactions }));
        callback(null, req.pdb, 'http_transactions_update_list', [null, null, JSON.stringify({ transactions: transactions })]);
    });
};
