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
create a folder called \_custom \*note \_custom\_ contains some example override files for you to use
create a file called .env and copy the contents of \_env into it
create a file called wrangler.toml and copy the contents of \_wrangler.toml into it
create a file called .dev.vars and copy the contents of \.dev.vars into it

run one of the following

./build.sh integrity
resets the core file

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

TEST

If you want to run the jest tests run

npm test

Your admin is now in \_site run a http-server there and away you go.

There is a custom table called adminuser so dont call one of your tables this.

CUSTOM OVERRIDES

NEW FUNCTIONALITY

Create a folder with new\_ at the front and this will copy across whole new sections of code into the admin

File structure

..new\_<name>
....tableAdd.njk //core add file
....tableView.njk //core view file
....tableIndex.njk //core index file
....tableEdit.njk //core edit file
....<fileName>.njk //can be as many as you want
....api.js // will be copied to the functions folder

- do we require the table?

Output
..\_site/
....add.html
....view.html
....index.html
....edit.html
....<fileName>.html
...functions/api/
....api.js

TABLE FUNCTIONALITY

custom table overrides should be a folder laid out in the following manner

File structure

..table\_<name>
....tableIndex <--- overrides the the table Index file
....tableAdd.nkj <--- overrides the table Add file
....tableEdit.njk <--- overides the table edit file
....<fileName>.njk
....api.js <--- overrides the api endpoint (this can be called anything.js)

Output

..\_site
....<name>
........add.html
........view.html
........index.html
........edit.html
........<fileName>.html
....functions/api
........<name>.js

CUSTOM API FUNCTIONALITY

custom function overrides should be in a folder laid out in the following manner

File strucuture
..\_custom
....functions
......customfunction1.js
......customfunction2.js

Output

..functions
....api
......customfunction1.js
......customfunction2.js

LAYOUTS

This will copy custom layouts into the \_corenjks this is a preprocess (all other custom functionality is post process) as it exposes all the custom layout to be used by the rest of the site

File strucuture
..\_custom
....layouts
......<filename>.njk //remember to use something unique as layout.njk is used by the system

Output

..\_corenjks
....<filename>.njk

SOURCE

Everything in the \_source folder will be copied to \_site/assets this is for static assets js, css, images etc.
