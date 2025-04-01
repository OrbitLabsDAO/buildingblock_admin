#!/bin/bash

# Supported parameters:
# delete (node buildit.js ) 


# Function to get current time in milliseconds
get_current_time_in_ms() {
    date +%s%3N | awk '{ printf "%d\n", $1 }'
}

# Capture the start time in milliseconds
start_time=$(get_current_time_in_ms)

echo "Starting build script"

ACTION="${1:-local}" # Default to "build" if no parameter is passed

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
    echo "killing rouge wrangler"
    kill -9 `lsof -t -i:8789`
    echo "Starting wrangler"
    npx wrangler pages dev _site --port 8789 --d1=DB  --binding SECRET=fdfdf  --kv=kvdata --local --live-reload  &
fi


if [ "$ACTION" = "kill" ]; then
    echo "killing rouge wrangler"
    kill -9 `lsof -t -i:8789`
 fi

if [ "$ACTION" = "db:local" ]; then
    echo "Building local database"
fi

 if [ "$ACTION" = "db:prod" ]; then
    echo "Building production database"
fi