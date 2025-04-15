ACTION="${1:-github}" # Default to "build" if no parameter is passed
BRANCH="${2}"

if [ "$ACTION" = "origin" ]; then

    echo "Resetting core files and running integrity check"
    node build_integrity.js


    if [ -n "$BRANCH" ]; then
        echo "Doing branch stuff..."
        if git show-ref --verify --quiet "refs/heads/$BRANCH"; then
            git checkout "$BRANCH"
        else
            git checkout -b "$BRANCH"
        fi
    else
        echo "⚠️  No branch provided — skipping checkout."
    fi



    read -p "Enter commit message: " COMMITMESSAGE


    echo "Moving files to keep them safe"
    #todo check if their ia _tmp file and if not create one
    #todo move sql/schema.sql to _tmp
    #todo copy _tmp/_schema.sql to sql

    #todo change the move to the _tmp directory
    mkdir -p _site/tmp
    mv _source _site/tmp/
    # Move entire _custome into _site/tmp2 to preserve structure
    mkdir -p _site/tmp2
    mv _custom _site/tmp2/


    git add .
    git commit -m "$COMMITMESSAGE"

    if [ -n "$BRANCH" ]; then
        git push "$ACTION" "$BRANCH"
    else
        git push "$ACTION"
    fi

    #todo delete sql/schema.sql
    #todo move _tmp/_schema.sql to sql


    # Restore _source
    mv _site/tmp/_source ./_source
    rmdir _site/tmp 2>/dev/null  # Clean up if empty

    mv _site/tmp2/_custom ./_custom
    rmdir _site/tmp2 2>/dev/null  # Optional cleanup if empty
    
    echo "✅ Done!"
    exit
fi


if [ "$ACTION" = "github" ]; then
    if [ -n "$BRANCH" ]; then
        echo "Doing branch stuff..."
        git checkout "$BRANCH" 2>/dev/null || echo "⚠️  Warning: Could not switch to branch '$BRANCH'."
    else
        echo "⚠️  No branch provided — skipping checkout."
    fi

    read -p "Enter commit message: " COMMITMESSAGE
    git add .
    git commit -m "$COMMITMESSAGE"

    if [ -n "$BRANCH" ]; then
        git push "$ACTION" "$BRANCH"
    else
        git push "$ACTION"
    fi

    echo "✅ Done!"
    exit
fi

echo "Unknown remote $ACTION"
