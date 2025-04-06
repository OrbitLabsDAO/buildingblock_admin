adminjamstack is a back end admin control panel buid to run on cloudflare pages.

It has the following

    Builds table managment and full API from a schema.sql file in a JAM style
    Build the whole admin is as jam stack allowing you to easily push to CF
    Create an endpoint for each table in CF pages functions directory from the APIgenerator file
    Full user management using JWT
    allows you to write custom code in the _custom directory to avoid code mix

USAGE

git clone https://github.com/OrbitLabsDAO/adminjamstack.git
put a sql file in the sql dir (or use the example one)
rename _custom_ to \_custom and you can put your custom in here ie \_api.njk will override the standard API
rename \_env to .env and set the vars
rename \_wrangler.toml to wrangler.toml
rename \_.dev.vars to .dev_vars

run one of the following

./build.sh kill
this will kill wrangler

./build.sh db
This will create the database

./build.sh dbimport:local
This will build the SQL in the schema.sql file on local

./build.sh dbimport:prod
This will build the SQL in the schema.sql file on production

./build.sh
This will generate the site

./build.sh start
This will launch a local version of the site

Your admin is now in \_site run a http-server there and away you go.

There is a custom table called adminuser so dont call one of your tables this.

CUSTOM OVERRIDES

custom table overrides should be a folder laid out in the following manner

table\_<tablename>
..tableIndex <--- overrides the the table Index file
..tableAdd.nkj <--- overrides the table Add file
..tableEdit.njk <--- overides the table edit file
..api.js <--- overrides the api endpoint (this can be called anything.js)

custom function overrides should be in a folder laid out in the following manner

\_customs/functions
..customfunction1.js
..customfunction2.js

This will move the to

functions/api/commonfunction1.js
functions/api/commonfunction2.js
