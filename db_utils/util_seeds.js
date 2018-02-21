(function (root) {
    if(!plv8.ufn){
    var sup = plv8.find_function("plv8_startup");
    sup();
  }


    plv8.ufn.new_profile = function(email, first_name, last_name, password){
		var md = moment();
		var create_date = md.format("YYYY-MM-DD");
		var create_time = md.format('YYYY-MM-DDTHH:mm:ss');
		var create_display_time = md.format('YYYY-MM-DD HH:mm');

		var sql = 'select id from tb_profile where email = $1;';
		var sqlres = plv8.execute(sql, email);
		if(sqlres.length > 0){
			return;
		};

		var sql_insert = 'insert into tb_profile (email, first_name, last_name, password, jdata) ';
		sql_insert += 'values($1,$2,$3,$4,$5) returning id; ';
		sql_res = plv8.execute(sql_insert, email, first_name, last_name, password, {create_date : create_time});
		var profile_id = sql_res.id;
    };




    
  
    plv8.ufn.new_area = function(name){
      var md = moment();
      var create_date = md.format("YYYY-MM-DD");
      var create_time = md.format('YYYY-MM-DDTHH:mm:ss');
      var create_display_time = md.format('YYYY-MM-DD HH:mm');
  
      var sql = 'select name from tb_area where name = $1;';
      var sqlres = plv8.execute(sql, name);
      if(sqlres.length > 0){
          return;
      }
  
      var sql_insert = 'insert into tb_area (name, create_date, create_time, create_display_time) ';
      sql_insert += 'values($1,$2,$3,$4) returning id; ';
      sql_res = plv8.execute(sql_insert, name, create_date, create_time, create_display_time);
      var area_id = sql_res.id;
    };
  
    plv8.ufn.new_bus_unit = function(code, name){
      var md = moment();
      var create_date = md.format("YYYY-MM-DD");
      var create_time = md.format('YYYY-MM-DDTHH:mm:ss');
      var create_display_time = md.format('YYYY-MM-DD HH:mm');
  
      var sql = 'select code from tb_business_unit where code = $1;';
      var sqlres = plv8.execute(sql, code);
      if(sqlres.length > 0){
          return;
      }
  
      var sql_insert = 'insert into tb_business_unit (code, name, create_date, create_time, create_display_time) ';
      sql_insert += 'values($1,$2,$3,$4,$5) returning id; ';
      sql_res = plv8.execute(sql_insert, code, name, create_date, create_time, create_display_time);
      var bus_unit_id = sql_res.id;
    };
  
    plv8.ufn.new_domain = function(gl_code, name, business_unit_id, province_id){
      var md = moment();
      var create_date = md.format("YYYY-MM-DD");
      var create_time = md.format('YYYY-MM-DDTHH:mm:ss');
      var create_display_time = md.format('YYYY-MM-DD HH:mm');
  
      var sql = 'select gl_code from tb_domain where gl_code = $1;';
      var sqlres = plv8.execute(sql, gl_code);
      if(sqlres.length > 0){
          return;
      }
  
      var sql_insert = 'insert into tb_domain (gl_code, name, business_unit_id, province_id, create_date, create_time, create_display_time) ';
      sql_insert += 'values($1,$2,$3,$4,$5,$6,$7) returning id; ';
      sql_res = plv8.execute(sql_insert, gl_code, name, business_unit_id, province_id, create_date, create_time, create_display_time);
      var domain_id = sql_res.id;
    };
  
    plv8.ufn.new_income_type = function(income_gl_code, income_name){
      var md = moment();
      var create_date = md.format("YYYY-MM-DD");
      var create_time = md.format('YYYY-MM-DDTHH:mm:ss');
      var create_display_time = md.format('YYYY-MM-DD HH:mm');
  
      var sql = 'select income_gl_code from tb_income_type where income_gl_code = $1;';
      var sqlres = plv8.execute(sql, income_gl_code);
      if(sqlres.length > 0){
          return;
      }
  
      var sql_insert = 'insert into tb_income_type (income_gl_code, income_name, create_date, create_time, create_display_time) ';
      sql_insert += 'values($1,$2,$3,$4,$5) returning id; ';
      sql_res = plv8.execute(sql_insert, income_gl_code, income_name, create_date, create_time, create_display_time);
      var income_type_id = sql_res.id;
    };
  

    
    plv8.ufn.new_project = function(kpi_gl_code, project_gl_code, name, area_id){
      var md = moment();
      var create_date = md.format("YYYY-MM-DD");
      var create_time = md.format('YYYY-MM-DDTHH:mm:ss');
      var create_display_time = md.format('YYYY-MM-DD HH:mm');
  
      var sql = 'select id from tb_project where name = $1;';
      var sqlres = plv8.execute(sql, name);
      if(sqlres.length > 0){
          return;
      }
  
      var sql_insert = 'insert into tb_project (kpi_gl_code, project_gl_code, name, area_id, create_date, create_time, create_display_time) ';
      sql_insert += 'values($1,$2,$3,$4,$5,$6,$7) returning id; ';
      sql_res = plv8.execute(sql_insert, kpi_gl_code, project_gl_code, name, area_id, create_date, create_time, create_display_time);
      var project_id = sql_res.id;
    };
  
    plv8.ufn.new_province = function(abrv, name){
      var md = moment();
      var create_date = md.format("YYYY-MM-DD");
      var create_time = md.format('YYYY-MM-DDTHH:mm:ss');
      var create_display_time = md.format('YYYY-MM-DD HH:mm');
  
      var sql = 'select abrv from tb_province where abrv = $1;';
      var sqlres = plv8.execute(sql, abrv);
      if(sqlres.length > 0){
          return;
      }
  
      var sql_insert = 'insert into tb_province (abrv, name, create_date, create_time, create_display_time) ';
      sql_insert += 'values($1,$2,$3,$4,$5) returning id; ';
      sql_res = plv8.execute(sql_insert, abrv, name, create_date, create_time, create_display_time);
      var province_id = sql_res.id;
    };
  
    plv8.ufn.new_volunteer_type = function(description){
          var md = moment();
          var create_date = md.format("YYYY-MM-DD");
          var create_time = md.format('YYYY-MM-DDTHH:mm:ss');
          var create_display_time = md.format('YYYY-MM-DD HH:mm');
  
          var sql = 'select description from tb_volunteer_type where description = $1;';
          var sqlres = plv8.execute(sql, description);
          if(sqlres.length > 0){
              return;
          }
  
          var sql_insert = 'insert into tb_volunteer_type (description, create_date, create_time, create_display_time) ';
          sql_insert += 'values($1,$2,$3,$4) returning id; ';
  
          sql_res = plv8.execute(sql_insert, description, create_date, create_time, create_display_time);
          var volunteer_type_id = sql_res.id;
    };
    
    plv8.ufn.new_volunteer_subtype = function(volunteer_type_id, description) {
          var md = moment();
          var create_date = md.format("YYYY-MM-DD");
          var create_time = md.format('YYYY-MM-DDTHH:mm:ss');
          var create_display_time = md.format('YYYY-MM-DD HH:mm');
  
          var sql = 'select id from tb_volunteer_subtype where volunteer_type_id = $1 AND description = $2;';
          var sqlres = plv8.execute(sql, volunteer_type_id, description);
          if(sqlres.length > 0){
              return(result);
          }
  
          var sql_insert = 'insert into tb_volunteer_subtype (volunteer_type_id, description, create_date, create_time, create_display_time ) ';
          sql_insert += 'values($1,$2,$3,$4,$5)) returning id; ';
  
          sql_res = plv8.execute(sql_insert, volunteer_type_id, description, create_date, create_time, create_display_time);
  
    };
  
    plv8.ufn.new_status = function(state, status_type) {
          var md = moment();
          var create_date = md.format("YYYY-MM-DD");
          var create_time = md.format('YYYY-MM-DDTHH:mm:ss');
          var create_display_time = md.format('YYYY-MM-DD HH:mm');
      
      var sql = 'select state from tb_status where state = $1;';
      var sqlres = plv8.execute(sql, state);
      if(sqlres.length > 0){
          return;
      }
          var sql_insert = 'insert into tb_status (state, status_type, create_date, create_time, create_display_time) ';
          sql_insert += 'values($1,$2,$3,$4,$5) returning id; ';
          sql_res = plv8.execute(sql_insert, state, status_type, create_date, create_time, create_display_time);
    };

  
    plv8.ufn.new_staff_role = function(role) {
          var md = moment();
          var create_date = md.format("YYYY-MM-DD");
          var create_time = md.format('YYYY-MM-DDTHH:mm:ss');
          var create_display_time = md.format('YYYY-MM-DD HH:mm');
      
      var sql = 'select role from tb_staff_role where role = $1;';
      var sqlres = plv8.execute(sql, role);
      if(sqlres.length > 0){
          return;
      }
          var sql_insert = 'insert into tb_staff_role (role, create_date, create_time, create_display_time) ';
          sql_insert += 'values($1,$2,$3,$4) returning id; ';
          sql_res = plv8.execute(sql_insert, role, create_date, create_time, create_display_time);
    };
    
  
  }(this));