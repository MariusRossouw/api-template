do language plv8 $$

  var test_profile = [
		{'email':'sean@stratech.co.za', 'first_name':'Sean', 'last_name':'Curtis', 'password':'admin1234'},
    {'email':'marius@stratech.co.za', 'first_name':'Marius', 'last_name':'Rossouw', 'password':'admin1234'}
  ];

  // name, jdata, first_name, last_name, email, password, school_name, type, contact_number, grade

  for(var i = 0; i < test_profile.length; i++){
		var p = test_profile[i];
    plv8.ufn.new_profile(p.email, p.first_name, p.last_name, p.password);
  };

$$;
