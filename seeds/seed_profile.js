do language plv8 $$

  if(!plv8.ufn){
    var sup = plv8.find_function("plv8_startup");
    sup();
  }

  var test_profile = [
		{'email':'sean@stratech.co.za', 'first_name':'Sean', 'last_name':'Curtis', 'password':'sean1'},
    {'email':'marius@stratech.co.za', 'first_name':'Marius', 'last_name':'Rossouw', 'password':'marius1'},
    {'email':'simo@stratech.co.za', 'first_name':'Simo', 'last_name':'Mafuxwana', 'password':'simo1'},
    {'email':'renee@stratech.co.za', 'first_name':'Renee', 'last_name':'van Heerden', 'password':'renee1'},
    {'email':'Ben@stratech.co.za', 'first_name':'Ben', 'last_name':'Teng', 'password':'ben1'}
  ];

  // name, jdata, first_name, last_name, email, password, school_name, type, contact_number, grade

  for(var i = 0; i < test_profile.length; i++){
		var p = test_profile[i];
    plv8.ufn.new_profile(p.email, p.first_name, p.last_name, p.password);
  };

$$;
