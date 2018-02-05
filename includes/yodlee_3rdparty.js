var request = require('request');
var async = require('async');
var _ = require('underscore');
var http = require('http');
var querystring = require("querystring");
var moment = require("moment");

var utils = require("../includes/utils.js");

exports.test = test;
function test(payload){
	console.log('PAYLOAD: ', payload);
	return {success: true};
}

// ====== action codes ======
// coblogin
// getOAuthAccessToken
// renewConversation
// login
// register
// executeUserSearchRequest
// accountSummary
// activateItemAccount
// deactivateItemAccount
// startSiteRefresh
// fastLink
// getLoginFormForContentService
// getSiteRefreshInfo
// getSiteAccounts

exports.yodlee_generic = yodlee_generic;
function yodlee_generic(payload, callback){
  var result = {
    http_code: 200,
    message: '',
    data: {}
  };
	console.log('Generic Yodlee Call');
  var headers = {
    'User-Agent': 'Mozilla/5.0',
    'Content-Type': 'application/json'
  };
  
  if(payload.yodlee_action.code != 'coblogin'){
    headers.Authorization = '{cobSession='+payload.session_obj.cobSession;
  }
  if(payload.yodlee_action.code != 'login' && payload.yodlee_action.code != 'register'){
    headers.Authorization += ',userSession='+payload.session_obj.userSession;
  }
  headers.Authorization += '}';
  if(payload.yodlee_action.code == 'coblogin'){
    delete headers.Authorization;
  }

  var options = {
    url: payload.yodlee_action.url,
    method: payload.method,
    headers: headers
  }

  if(payload.method != 'GET'){
    options.json = payload.params;
  }

  console.log('PARAMS: ', payload.params);

  console.log('Yodlee OPTIONS: ',options);

  request(options, function(err, response, body) {
    if(err){
      console.log(err);
      result.http_code = 500;
      result.message = "Request to yodlee failed";
      result.data = body;
      callback(null, result);
    }else{
      if(typeof body == 'string'){
        result = JSON.parse(body);
      }else{
        result = body;
      }
      result.http_code = response.statusCode;
      result.message = '';
      callback(null, result);
    }
  });
}