(function (root) {
	if(!plv8.ufn){
		var sup = plv8.find_function("plv8_startup");
		sup();
	}

  plv8.ufn.validate_3rdparty_credentials = function(project_name, apicred){
  	var project = {};

  	var sql = "select * from tb_project where project_name = $1 and apicred = $2;";
  	var sqlres = plv8.execute(sql, project_name, apicred);

  	if(sqlres.length == 0){
  		project.http_code = 404;
  		project.message = 'project not found';
  		return project;
  	}

    project = sqlres[0];

    project.http_code = 200;
    project.message = '';

  	project.cobrand_login = sqlres[0].cobrand_login;
  	project.cobrand_password = sqlres[0].cobrand_password;

  	return project;
  };

  plv8.ufn.get_action_code = function(project,url){
    var action = {
      failed: false
    };

    action.url = project.yodlee_url;

    switch(url){
      case '/api/authenticate/coblogin':
        action.code = 'coblogin';
        action.url += '/authenticate/coblogin';
      break;
      case '/api/authenticate/login':
        action.code = 'login';
        action.url += '/user/login';
      break;
      default:
        action.code = '';
        action.url = '';
        action.failed = true;
    };

    return action;
  };

  plv8.ufn.validate_3rdparty_token = function(token){
    var project = {};

    var sql = "select * from tb_project where jdata->>'cobSession' = $1;";
    var sqlres = plv8.execute(sql, token);

    if(sqlres.length == 0){
      project.http_code = 401;
      project.message = 'session invalid';
      return project;
    }

    project = sqlres[0];

    project.http_code = 200;
    project.message = '';

    project.cobSession = token;

    return project;
  };

  plv8.ufn.validate_3rdparty_user = function(token){
    var user = {};

    var sql = "select * from tb_yodlee_user where jdata->>'userSession' = $1;";
    var sqlres = plv8.execute(sql, token);

    if(sqlres.length == 0){
      user.http_code = 401;
      user.message = 'session expired';
      return user;
    }

    user = sqlres[0];

    user.http_code = 200;
    user.message = '';

    user.userSession = token;

    return user;
  };

  plv8.ufn.get_3rdparty_user = function(login_name){
    var user = {};

    var sql = "select * from tb_yodlee_user where login_name = $1;";
    var sqlres = plv8.execute(sql, login_name);

    if(sqlres.length == 0){
      user.http_code = 401;
      user.message = 'user not found';
      return user;
    }

    user = sqlres[0];

    user.http_code = 200;
    user.message = '';

    return user;
  };

  plv8.ufn.get_auth_obj = function(auth){
    var auth_obj = {};

    var auth_str = auth.substr(1,(auth.length - 2));
    
    var session_arr = auth_str.split(',');
    if(session_arr.length > 0){
      var cobSession = session_arr[0];
      auth_obj.cobSession = cobSession.split('=')[1];
    }
    if(session_arr.length > 1){
      var userSession = session_arr[1];
      auth_obj.userSession = userSession.split('=')[1];
    }

    return auth_obj;
  };

}(this));