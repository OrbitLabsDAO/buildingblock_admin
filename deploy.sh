ACTION="${1:-github}" # Default to "build" if no parameter is passed
BRANCH="${2:-main}"


if [ "$ACTION" = "origin" ]; then
    echo "Resetting core files and running integrity check"
    node build_integrity.js

    # Move files
    echo "Moving the source file so it is nice and safe"
    mv _source/* _custom/

    # Ask for commit message
    read -p "Enter commit message: " COMMITMESSAGE

    echo "Doing the all the git things"
    # Git operations
    git checkout "$BRANCH"
    git add .
    git commit -a -m "$COMMITMESSAGE"
    git push "$ACTION" "$BRANCH"

    echo "Moving the source file back"
    # Restore folder structure
    mv _custom/_source/* _custom/ _source
    echo "Done!"
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