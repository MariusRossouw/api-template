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

}(this));