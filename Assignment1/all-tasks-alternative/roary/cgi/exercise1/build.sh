#!/bin/bash

# This script compiles the java files in the src folder and
# create launcher scripts with the format <CLASS-NAME>.cgi

cd $(dirname $0)
mkdir bin 2>/dev/null
rm -rf ./bin/*
dataFolder=/var/www/roary/data/exercise1

for file in ./src/*
do
    javac -d ./bin $file
    file=${file##*/}
    file=${file%.*}
    echo '#!/bin/sh'>./bin/$file.cgi
    echo 'cd $(dirname $0)'>>./bin/$file.cgi
    echo "java $file $dataFolder \$@">>./bin/$file.cgi
    chmod +x ./bin/$file.cgi
done
