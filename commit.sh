ACTION="${1:-github}" # Default to "build" if no parameter is passed
BRANCH="${2:-main}"

ACTION="${1:-github}" # Default to "build" if no parameter is passed
BRANCH="${2:}"

if [ "$ACTION" = "origin" ]; then

    echo "Resetting core files and running integrity check"
    node build_integrity.js

    if [ -n "$BRANCH" ]; then
        echo "Doing branch stuff..."
        git checkout -b "$BRANCH"
        git checkout "$BRANCH"
       
    fi

    # TODO: check that the file does not already exist and delete it if it does.
    echo "Moving files to keep them safe"
    mkdir -p _site/tmp
    mv _source _site/tmp/

    # Git operations
    read -p "Enter commit message: " COMMITMESSAGE
    git add .
    git commit -m "$COMMITMESSAGE"
    git push "$ACTION" "$BRANCH"

    # Restore _source
    mv _site/tmp/_source ./_source
    rmdir _site/tmp 2>/dev/null  # Clean up if empty


    exit
fi