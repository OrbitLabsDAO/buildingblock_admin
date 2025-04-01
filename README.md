git clone https://github.com/OrbitLabsDAO/adminjamstack.git
put a sql file in the sql dir (or use the example one)
rename _custom_ to \_custom and you can put your custom in here ie \_api.njk will override the standard API
rename \_env to .env and set the vars
rename \_wrangler.toml to wrangler.toml

run

./build.sh db
This will create the database
./build.sh dbimport:local
This will build the SQL in the schema.sql file
./build.sh
This will generate the site
./build.sh start
This will launch a local version of the site

Your admin is now in \_site run a http-server there and away you go.

table transformations

is this the best way to achieve this? how do ORMs do it?

add "as\_" at the start of a filed name and it will not be shown in the add / edit pages
add "as_internal" field to any table and it will not render view, add or edit pages for this table
