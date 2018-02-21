drop table if exists tb_api_log;
CREATE TABLE IF NOT EXISTS tb_api_log (
  id SERIAL PRIMARY KEY,
  orig_id int,
  error text,
  type varchar(100),
  action_type varchar(50),
  action_name varchar(100),
  data jsonb,
  create_time varchar(24)
);

drop table IF EXISTS tb_profile;
CREATE TABLE IF NOT EXISTS tb_profile(
  id SERIAL PRIMARY KEY,
  first_name varchar(200),
	last_name varchar(200),
	email varchar(200),
	mobile_number VARCHAR(15),
	password varchar(50),
  image varchar(200),
  jdata jsonb,
  create_date varchar(24),
  create_time varchar(24),
  create_display_time varchar(24),
  update_date varchar(24),
  update_time varchar(24),
  update_display_time varchar(24)
);
INSERT INTO tb_profile (first_name, last_name, email, mobile_number, password) 
VALUES ('Marius','Rossouw','marius@stratech.co.za','0793328258','marius1'), ('Hymne','Rossouw','hymnect@gmail.com','0636601501','hymne1'), ('Yentl','Rossouw','yentl@yentl.com','0797777777','yentl1'), ('Deaglan','Rossouw','deaglan@woef.com','0639918722','deaglan1'), ('Riley','Rossouw','riley@hap.com','0820854082','riley1');

drop table if exists tb_project;
CREATE TABLE IF NOT EXISTS tb_project (
  id SERIAL PRIMARY KEY,
  project_name varchar(100),
  project_fe_repo_url varchar(300),
  project_be_repo_url varchar(300),
  project_staging_fe_url varchar(300),
  project_staging_be_url varchar(300),
  project_staging_db_url varchar(300),
  project_staging_server varchar(300),
  project_production_fe_url varchar(300),
  project_production_be_url varchar(300),
  project_production_db_url varchar(300),
  project_production_server varchar(300),
  project_image varchar(50),
  project_description text,
  jdata jsonb,
  create_date varchar(24),
  create_time varchar(24),
  create_display_time varchar(24)
);
INSERT INTO tb_project (project_name) 
VALUES ('CanServe'), ('Jando'), ('Conrati'), ('GetSure'), ('GoSure');


drop table IF EXISTS tb_project_team;
CREATE TABLE IF NOT EXISTS tb_project_team(
  id SERIAL PRIMARY KEY,
  profile_id int REFERENCES tb_profile(id),
  project_id int REFERENCES tb_project(id),
  role varchar(200),
  jdata jsonb,
  create_date varchar(24),
  create_time varchar(24),
  create_display_time varchar(24)
);
INSERT INTO tb_project_team (profile_id, project_id) 
VALUES (1,1), (1,2), (1,4), (1,5), (2,3);


drop table IF EXISTS tb_sprint;
CREATE TABLE IF NOT EXISTS tb_sprint(
  id SERIAL PRIMARY KEY,
  sprint_name varchar(200),
  project_id int REFERENCES tb_project(id),
  jdata jsonb,
  create_date varchar(24),
  create_time varchar(24),
  create_display_time varchar(24)
);
INSERT INTO tb_sprint (sprint_name, project_id) 
VALUES ('0',1), ('1',1), ('2',1), ('3',1), ('4',1);

drop table IF EXISTS tb_element;
CREATE TABLE IF NOT EXISTS tb_element(
  id SERIAL PRIMARY KEY,
  project_id int REFERENCES tb_project(id),
  sprint_id int REFERENCES tb_sprint(id),
  element_name varchar(200),
  expand boolean,
  deleted boolean,
  image varchar(200),
  jdata jsonb,
  create_date varchar(24),
  create_time varchar(24),
  create_display_time varchar(24),
  update_date varchar(24),
  update_time varchar(24),
  update_display_time varchar(24)
);
INSERT INTO tb_element (project_id, sprint_id, element_name, expand) 
VALUES (1,1,'Login', false), (1,1,'Register', false), (1,1,'Dashboard', false), (1,1,'Update Profile', false);

drop table IF EXISTS tb_component;
CREATE TABLE IF NOT EXISTS tb_component(
  id SERIAL PRIMARY KEY,
  element_id int REFERENCES tb_element(id),
  sprint_id int REFERENCES tb_sprint(id),
  component_name varchar(200),
	description text,
	request_object jsonb,
	response_object jsonb,
  expand boolean,
  deleted boolean,
  image varchar(200),
  jdata jsonb,
  create_date varchar(24),
  create_time varchar(24),
  create_display_time varchar(24),
  update_date varchar(24),
  update_time varchar(24),
  update_display_time varchar(24)
);
INSERT INTO tb_component (element_id, sprint_id, component_name, description) 
VALUES (1,1,'Login Form','Custom Form Fields for Login In'), (1,1,'Social Media Login Option','FaceBook, Twitter, LinkedIn, Google, GitHub Login options');

drop table IF EXISTS tb_task;
CREATE TABLE IF NOT EXISTS tb_task(
  id SERIAL PRIMARY KEY,
  component_id int REFERENCES tb_component(id),
  sprint_id int REFERENCES tb_sprint(id),
  task_name varchar(200),
	description text,
	request_object jsonb,
	response_object jsonb,
	percentage_complete int,
	size int,
  deleted boolean,
	status VARCHAR(20),
	kind VARCHAR(20),
	type varchar(20),
	priority int,
  image varchar(200),
	profile_id int REFERENCES tb_profile(id),
  jdata jsonb,
  create_date varchar(24),
  create_time varchar(24),
  create_display_time varchar(24),
  update_date varchar(24),
  update_time varchar(24),
  update_display_time varchar(24)
);
INSERT INTO tb_task (component_id, sprint_id, task_name, description, percentage_complete, size, kind, type, status, profile_id, priority) 
VALUES (1,1,'Create Form','Email Field, Password Field, Login Button', 80, 2, 'Front End', 'New Feature', 'To be Groomed', 1, 1), (1,1,'Design Layout','Positioning of the Form Elements', 100, 3, 'Design', 'New Feature', 'To be Groomed', 2, 1);

drop table IF EXISTS tb_image;
CREATE TABLE IF NOT EXISTS tb_image(
  id SERIAL PRIMARY KEY,
  image_name varchar(200),
  project_id int REFERENCES tb_project(id),
  profile_id int REFERENCES tb_profile(id),
  element_id int REFERENCES tb_element(id),
  component_id int REFERENCES tb_component(id),
	task_id int REFERENCES tb_task(id),
  type varchar(20),
  jdata jsonb,
  create_date varchar(24),
  create_time varchar(24),
  create_display_time varchar(24)
);
