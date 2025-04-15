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
    # Check if there is a _tmp directory and if not create one
    if [ ! -d "_tmp" ]; then
        mkdir -p _tmp
    fi

    # Move sql/schema.sql to _tmp
    mv sql/schema.sql _tmp/

    # Copy _tmp/_schema.sql to sql
    cp _tmp/_schema.sql sql/
    read -p wait1

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

    # Delete sql/schema.sql
    rm sql/schema.sql

    # Move _tmp/_schema.sql to sql
    mv _tmp/_schema.sql sql/
    read -p wait2

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
