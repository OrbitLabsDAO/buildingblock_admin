git clone https://github.com/OrbitLabsDAO/adminjamstack.git
put a sql file in the sql dir (or use the example one)
rename _custom_ to \_custom and you can put your custom in here ie \_api.njk will override the standard API
rename \_env to .env and set the vars
rename \_wrangler.toml to wrangler.toml
rename \_.dev.vars to .dev_vars

run
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
