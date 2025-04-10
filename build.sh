#!/bin/bash

# Supported parameters:
# delete (node buildit.js ) 
ACTION="${1:-local}" # Default to "build" if no parameter is passed


if [ "$ACTION" = "init" ]; then
    if [ ! -d "_custom" ]; then
        mkdir _custom
    fi

    #copy _env to .env
    if [ ! -f ".env" ]; then
        cp _env .env
    fi

    if [ ! -f ".dev.vars" ]; then
        cp _.dev.vars .dev.vars
    fi

    #copy _wrangler.toml to wrangler.toml
    if [ ! -f "wrangler.toml" ]; then
        cp _wrangler.toml wrangler.toml
    fi

    exit   
fi

if [ "$ACTION" = "integrity" ]; then
    echo "reseting core files and running integrity check"
    node build_integrity.js
    exit
fi

if [ "$ACTION" = "kill" ]; then
    echo "killing rouge wrangler"
    kill -9 `lsof -t -i:8789`
    exit
 fi



if [ "$ACTION" = "db" ]; then
    echo "Creating database"
    npx wrangler d1 create adminjamstack
    exit
fi

if [ "$ACTION" = "dbimport:local" ]; then
    echo "Building database"
    npx wrangler d1 execute adminjamstack --local --file=./sql/schema.sql
    exit
fi

if [ "$ACTION" = "dbimport:prod" ]; then
    echo "Building database"
    npx wrangler d1 execute adminjamstack --remote --file=./sql/schema.sql 
    exit
fi


# Function to get current time in milliseconds
get_current_time_in_ms() {
    date +%s%3N | awk '{ printf "%d\n", $1 }'
}

# Capture the start time in milliseconds
start_time=$(get_current_time_in_ms)

echo "Starting build script"


# handle production or local build
if [ "$ACTION" = "prod" ]; then
    echo "Building production site"
    node buildit.js prod
else
    echo "Building local site"
    node buildit.js
fi


# Capture the end time in milliseconds
end_time=$(get_current_time_in_ms)

# Calculate the execution time in milliseconds
execution_time=$((end_time - start_time))

# Calculate minutes, seconds, and milliseconds
minutes=$((execution_time / 60000))
seconds=$(( (execution_time % 60000) / 1000 ))
milliseconds=$((execution_time % 1000))

# Format the output string based on the calculated values
if [ $minutes -eq 0 ]; then
    printf "Build script completed in %d.%03d seconds\n" $seconds $milliseconds
else
    printf "Build script completed in %d minutes %d.%03d seconds\n" $minutes $seconds $milliseconds
fi

if [ "$ACTION" = "start" ]; then

    echo "killing rouge wrangler(s)"
   
    # there are different methods to kill the running process chose the one that works for you.
    #1: kill wrangler
     ps aux | grep "npx wrangler pages dev"
    pkill -f "npx wrangler pages dev"
    #2: Kill the running processed
    kill -9 `lsof -t -i:8789`
    #3: kill all node based in the logged in user
    #pkill -u $(whoami) -f "node"
    echo "Starting wrangler"
    npx wrangler pages dev _site --port 8789 --d1=adminjamstack  --binding SECRET=fdfdf  --kv=kvdata --local --live-reload  &
fi


