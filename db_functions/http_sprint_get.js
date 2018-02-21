create or replace function http_sprint_get(http_req_text text) returns JSON as
$$
if (!plv8.ufn) { 
  var sup = plv8.find_function("plv8_startup");
  sup();
 }

  var result = {
    http_code:200,
    message:'',
    data:{}
  };

  var http_req = plv8.ufn.http_req_parse(http_req_text);
  if (http_req.err_message != '') {
    result.http_code = 403;
    result.message = http_req.err_message;
    return(result);
  }

  if (!http_req.body.sprint_id ) {
    result.http_code = 403;
    result.message = 'sprint_id required';
    return(result);
  };

  

  var s = " \
    SELECT \
      json_build_object( \
        'id', id, \
        'element_name', element_name, \
        'expand',expand, \
        'image',image, \
        'components', ( \
        SELECT  \
          json_agg(json_build_object( \
          'id', id, \
          'component_name', component_name, \
          'description', description, \
          'expand',expand, \
          'image',image, \
          'tasks', ( \
          SELECT  \
            json_agg(json_build_object( \
              'id', id, \
              'task_name', task_name, \
              'description', description, \
              'percentage_complete', percentage_complete, \
              'size', size, \
              'kind', kind, \
              'type', type, \
              'status', status, \
              'priority',priority \
            )) \
FROM tb_task \
WHERE component_id = tb_component.id \
)  \
)) \
FROM tb_component \
WHERE element_id = tb_element.id \
) \
) AS result \
FROM tb_element \
WHERE sprint_id = $1 \
  ";
  plv8.elog(INFO, s);
  var query_result = plv8.execute(s,http_req.body.sprint_id);
  var final = [];
  for(var i = 0; i < query_result.length; i++){
    final.push(query_result[i].result);
  }

result.data.records = final;

// result.data.records = 
//      [
//         {
//             name: "Element 1",
//             id: 1,
//             project_name: 'Canserve',
//             project_id: 12,
//             expand: false,
//             components: [
//                 {
//                     name: "Component 1",
//                     id: 2,
//                     element_id: 1,
//                     percentage_complete: 80,
//                     size: 7,
//                     expand: false,
//                     tasks: [
//                         {
//                             name: "Task 1",
//                             task_id: 3,
//                             project_id: 12,
//                             kind: 'UX',
//                             percentage_complete: 100,
//                             size: 1,
//                             color: '#73f9fd',
//                         },
//                         {
//                             name: "Task 2",
//                             task_id: 4,
//                             project_id: 12,
//                             kind: 'Design',
//                             percentage_complete: 90,
//                             size: 1,
//                             color: '#6afc76',
//                         },
//                         {
//                             name: "Task 3",
//                             task_id: 5,
//                             project_id: 12,
//                             kind: 'BackEnd',
//                             percentage_complete: 20,
//                             size: 1,
//                             color: '#fdbc68',
//                         },
//                         {
//                             name: "Task 4",
//                             task_id: 6,
//                             project_id: 12,
//                             kind: 'UX',
//                             percentage_complete: 50,
//                             size: 1,
//                             color: '#73f9fd',
//                         },
//                     ]
//                 },
//                 {
//                     name: "Component 2",
//                     id: 7,
//                     element_id: 1,
//                     percentage_complete: 20,
//                     size: 12,
//                     expand: false,
//                     tasks: [
//                         {
//                             name: "Task 5",
//                             task_id: 8,
//                             project_id: 12,
//                             kind: 'FrontEnd',
//                             percentage_complete: 30,
//                             size: 1,
//                             color: '#fd9fe1',
//                         },
//                         {
//                             name: "Task 6",
//                             task_id: 9,
//                             project_id: 12,
//                             kind: 'BackEnd',
//                             percentage_complete: 60,
//                             size: 1,
//                             color: '#fdbc68',
//                         },
//                         {
//                             name: "Task 7",
//                             task_id: 10,
//                             project_id: 12,
//                             kind: 'UX',
//                             percentage_complete: 50,
//                             size: 1,
//                             color: '#73f9fd',
//                         },
//                     ]
//                 }
//             ]
//         }
//     ]






// "records": [
//   {
//     "id": 1,
//     "element_name": "Login",
//     "components": [
//       {
//         "id": 1,
//         "component_name": "Login Form",
//         "description": "Custom Form Fields for Login In",
//         "tasks": [
//           {
//             "id": 3,
//             "task_name": "Create Form",
//             "description": "Email Field, Password Field, Login Button",
//             "percentage_complete": 80,
//             "size": 2,
//             "kind": "Front End",
//             "type": "New Feature",
//             "status": "To be Groomed",
//             "priority": 1
//           },
//           {
//             "id": 4,
//             "task_name": "Design Layout",
//             "description": "Positioning of the Form Elements",
//             "percentage_complete": 100,
//             "size": 3,
//             "kind": "Design",
//             "type": "New Feature",
//             "status": "To be Groomed",
//             "priority": 1
//           }
//         ]
//       },
//       {
//         "id": 2,
//         "component_name": "Social Media Login Option",
//         "description": "FaceBook, Twitter, LinkedIn, Google, GitHub Login options",
//         "tasks": null
//       }
//     ]
//   },
//   {
//     "id": 2,
//     "element_name": "Register",
//     "components": null
//   },
//   {
//     "id": 3,
//     "element_name": "Dashboard",
//     "components": null
//   },
//   {
//     "id": 4,
//     "element_name": "Update Profile",
//     "components": null
//   }
// ]

  return (result);
$$ LANGUAGE plv8;