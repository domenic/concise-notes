#!/bin/bash

set -e

display_usage() {
    echo "Usage: $0 [arguments]"
    echo
    echo "1/ $0 dev"
    echo "2/ $0 testprod"
    echo "3/ $0 commit \"message\" [--force]"
}


commit() {
    message=("$@")
    git commit -m "${message[*]}"
}

build() {
    git add --all && \
    commit $1 && \
    git push && \
    hexo generate $2 && \
    cd public && \
    git pull && \
    git add --all && \
    commit $1 && \
    git push
}

dev() {
    rm debug.log;
    hexo --debug --config _config_dev.yml serve
}

testprod() {
    rm debug.log;
    hexo --debug --config _config.yml serve
}

case "$1" in
    "dev" )
        dev
    ;;

    "testprod" )
        testprod
    ;;

    "commit" )
        if [[ -z "$3" ]]
        then
            if [[ -z "$2" ]]
            then
                echo "$0 $1 \"commit message\""
                echo "Please enter a git commit message to describe your modifications to the website"
            else
                build $2
            fi
        else
            build $2 $3
        fi
    ;;

    * )
        display_usage
    ;;
esac
