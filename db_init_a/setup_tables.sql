drop table IF EXISTS tb_profile;
CREATE TABLE IF NOT EXISTS tb_profile(
  id SERIAL PRIMARY KEY,
  email varchar(200),
  first_name varchar(200),
  last_name varchar(200),
  password varchar(200),
  jdata jsonb
);

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

drop table if exists tb_project;
CREATE TABLE IF NOT EXISTS tb_project (
  id SERIAL PRIMARY KEY,
  project_name varchar(200),
  yodlee_url varchar(100),
  cobrand_name varchar(100),
  cobrand_login varchar(50),
  cobrand_password varchar(50),
  app_id varchar(20),
  fastlink_url varchar(100),
  create_date varchar(24),
  create_time varchar(24),
  create_display_time varchar(24)
);

alter table tb_project add column status varchar(20);
alter table tb_project add column apicred varchar(100);
alter table tb_project add column jdata jsonb;

drop table if exists tb_service_log;
CREATE TABLE IF NOT EXISTS tb_service_log (
  id SERIAL PRIMARY KEY,
  template_name varchar(200),
  app_req jsonb,
  service_res jsonb,
  service_req jsonb,
  yodlee_res jsonb,
  status varchar(200),
  create_date varchar(24),
  create_time varchar(24),
  create_display_time varchar(24)
);

-- only if we need to store the accounts
drop table if exists tb_user_account;
CREATE TABLE IF NOT EXISTS tb_user_account (
  id SERIAL PRIMARY KEY,
  yodlee_acc_id varchar(200),
  yodlee_user_id integer,
  create_date varchar(24),
  create_time varchar(24),
  create_display_time varchar(24)
);

drop table if exists tb_yodlee_user;
CREATE TABLE IF NOT EXISTS tb_yodlee_user (
  id SERIAL PRIMARY KEY,
  project_id int,
  email varchar(200),
  login_name varchar(200),
  password varchar(200),
  create_date varchar(24),
  create_time varchar(24),
  create_display_time varchar(24)
);

alter table tb_yodlee_user add column profile_id int;

alter table tb_yodlee_user add column jdata jsonb;

drop table if exists tb_project_user;
CREATE TABLE IF NOT EXISTS tb_project_user (
  id SERIAL PRIMARY KEY,
  project_id int,
  yodlee_user_id int,
  create_date varchar(24),
  create_time varchar(24),
  create_display_time varchar(24)
);

alter table tb_project_user add column jdata jsonb;

drop table IF EXISTS tb_workflow;
CREATE TABLE IF NOT EXISTS tb_workflow (
  id SERIAL PRIMARY KEY,
  code varchar(100),
  entity_type varchar(100),
  entity_id int, 
  wf jsonb,
  jdata jsonb,
  create_date varchar(20),
  create_time varchar(40),
  create_display_time varchar(20)
);

drop table IF EXISTS tb_workflow_at;
CREATE TABLE IF NOT EXISTS tb_workflow_at (
  id SERIAL PRIMARY KEY,
  wf_id int,
  wf jsonb,
  display_time varchar(40)
);

drop table IF EXISTS tb_transaction;
CREATE TABLE IF NOT EXISTS tb_transaction (
  id SERIAL PRIMARY KEY,
  yodlee_user_id int,
  project_id int,
  yodlee_transaction_id varchar(100),
  amount varchar(50),
  currency varchar(10),
  type varchar(50),
  source varchar(100),
  description varchar(200),
  is_manual boolean,
  transaction_date varchar(10),
  status varchar(50),
  account_id varchar(100),
  balance varchar(100),
  jdata jsonb,
  create_date varchar(20),
  create_time varchar(40),
  create_display_time varchar(20)
);

drop table IF EXISTS tb_account;
CREATE TABLE IF NOT EXISTS tb_account (
  id SERIAL PRIMARY KEY,
  yodlee_user_id int,
  yodlee_account_id int,
  project_id int,
  account_name varchar(200),
  account_status varchar(100),
  account_number varchar(100),
  balance varchar(100),
  currency varchar(10),
  bank_name varchar(100),
  available_balance varchar(100),
  account_type varchar(100),
  jdata jsonb,
  create_date varchar(20),
  create_time varchar(40),
  create_display_time varchar(20)
);

drop table IF EXISTS tb_yodlee_log;
CREATE TABLE IF NOT EXISTS tb_yodlee_log (
  id SERIAL PRIMARY KEY,
  yodlee_user_id int,
  yodlee_account_id int,
  project_id int,
  request jsonb,
  response jsonb,
  status varchar(20),
  jdata jsonb,
  create_date varchar(20),
  create_time varchar(40),
  create_display_time varchar(20)
);

drop table IF EXISTS tb_yodlee_3rdparty_log;
CREATE TABLE IF NOT EXISTS tb_yodlee_3rdparty_log (
  id SERIAL PRIMARY KEY,
  project_id int,
  url varchar(200),
  action_code varchar(200),
  request jsonb,
  response jsonb,
  status varchar(20),
  method varchar(20),
  jdata jsonb,
  create_date varchar(20),
  create_time varchar(40),
  create_display_time varchar(20)
);   

