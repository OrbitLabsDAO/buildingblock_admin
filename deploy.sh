ACTION="${1:-github}" # Default to "build" if no parameter is passed
BRANCH="${2:-main}"


if [ "$ACTION" = "origin" ]; then
    echo "Resetting core files and running integrity check"
    node build_integrity.js

    # Move contents of _source into _site
    mv _source/* _site/tmp/

    # Ask user for commit message
    read -p "Enter commit message: " COMMITMESSAGE

    # Git operations
    git checkout "$BRANCH"
    git add .
    git commit -m "$COMMITMESSAGE"
    git push "$ACTION" "$BRANCH"

    # Restore _source from _site/_source
    mkdir -p _source
    mv _site/tmp/_source/* _source/
    rmdir _site/tmp/_source 2>/dev/null  # Optional cleanup if empty

    exit
fi


if [ "$ACTION" = "github" ]; then

    # Ask for commit message
    read -p "Enter commit message: " COMMITMESSAGE
    echo "Doing the all the git things"
    # Git operations
    git checkout "$BRANCH"
    git add .
    git commit -a -m "$COMMITMESSAGE"
    git push "$ACTION" "$BRANCH"
    echo "Done!"
    exit
fi

echo "Unknown remote $ACTION"