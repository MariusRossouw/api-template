#!/bin/bash

#clear everthing
node db_init_util/run_sql_script.js --file db_init_util/clear_db.js

node db_init_util/run_sql_script.js --file db_init_util/setup_plv8_startup.sql

node db_init_util/util_module_save_3rdparty.js --folder db_3rdparty_modules
node db_init_util/call_stored_function --name plv8_util_module_load_all_3rdparty

node db_init_util/util_module_save.js --folder db_utils
node db_init_util/call_stored_function --name plv8_util_module_load_all

node db_init_util/run_sql_script.js --folder db_functions

node db_init_util/run_sql_script.js --file db_init_a/setup_tables.sql

#setup tables and stored functions

#seed data
node db_init_util/run_sql_script.js --file seeds/seed_profile.js

#run the server
export NODE_SERVER_PORT=31017
node server.js

