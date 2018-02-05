create or replace function http_transaction_add(http_req_text text) returns JSON as
$$

 if(!plv8.ufn){
   var sup = plv8.find_function("plv8_startup");
   sup();
 }

  var result = {
    http_code : 200,
    error_code : "",
    message : "",
    data : {},
    errors : []
  };

  var http_req = plv8.ufn.http_req_parse(http_req_text);
  if(http_req.err_message !== ''){
    result.http_code = 403;
    result.message = http_req.err_message;
    return(result);
  }

   if(!http_req.body.transactions){
    result.http_code = 403;
    result.message = 'transaction list required';
    return(result);
  }

  var transactions = http_req.body.transactions;

  if(!http_req.body.project_id){
    result.http_code = 403;
    result.message = 'project id required';
    return(result);
  }
  
  // validate project
  var sql = "select id from tb_project where id = $1";
  var sqlres = plv8.execute(sql, http_req.body.project_id);

   if(sqlres.length == 0){
    result.http_code = 404;
    result.message = 'project not found';
    return(result);
  }

  if(!http_req.body.user){
    result.http_code = 403;
    result.message = 'user params required';
    return(result);
  }

  if(!http_req.body.user.id){
    result.http_code = 403;
    result.message = 'user id required';
    return(result);
  }
  
  // validate user
  var sql = "select id from tb_yodlee_user where id = $1";
  var sqlres = plv8.execute(sql, http_req.body.user.id);

  if(sqlres.length == 0){
    result.http_code = 404;
    result.message = 'user not found';
    return(result);
  }

  for(var i = 0; i < transactions.length; i++){
  	var jdata = {};
  	var transaction = transactions[i];

    // check if transaction exists

    var s_sql = "select id, yodlee_transaction_id from tb_transaction where yodlee_transaction_id = $1; ";
    var s_sqlres = plv8.execute(sql, transactions.id);

    if(sqlres.length == 0){

    	var md = moment();
  	  var create_date = md.format("YYYY-MM-DD");
  	  var create_time = md.format('YYYY-MM-DDTHH:mm:ss');
  	  var create_display_time = md.format('YYYY-MM-DD HH:mm');
    	var sql = "insert into tb_transaction ( \
    	yodlee_user_id, \
    	project_id, \
    	yodlee_transaction_id, \
    	amount, \
    	currency, \
    	type, \
    	source, \
    	description, \
    	is_manual, \
    	transaction_date, \
    	status, \
    	account_id, \
    	jdata, \
    	create_date, \
    	create_time, \
    	create_display_time \
    	) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16);";
    	var sqlres = plv8.execute(sql,
    		http_req.body.user.id,
    		http_req.body.project_id,
    		transaction.id,
    		transaction.amount.amount,
    		transaction.amount.currency,
    		transaction.baseType,
    		transaction.categorySource,
    		transaction.description.original,
    		transaction.isManual,
    		transaction.transactionDate,
    		transaction.status,
    		transaction.accountId,
    		jdata,
    		create_date,
    		create_time,
    		create_display_time
    	);
    }
  }

  return (result);

$$ LANGUAGE plv8;
