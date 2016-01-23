#!/bin/bash

if [[ -z "$1" ]]
then
    echo "$0 \"commit message\""
    echo "Please enter a git commit message to describe your modifications to the blog"
    exit
fi

commit() {
    message=("$@")
    git commit -m "${message[*]}"
}

git add --all && \
commit $1 && \
git push && \
hexo generate && \
cd public && \
git pull && \
git add --all && \
commit $1 && \
git push
