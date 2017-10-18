#!/bin/bash

# 1. copy into root npm package directory as npm-publish.sh
# 2. ensure script is executable
#    $ cd path/to/npm-publish.sh
#    $ chmod 755 npm-publish.sh
# 3. execute
#    $ ./npm-publish.sh

# Run unit tests (if present)
# echo "Building application and running unit tests..."
# karma start --watch false --single-run

pwd=$(pwd)
echo "Removing $pwd/dist directory..."
rm -rf "$pwd/dist"

# Angular CLI aot
# echo "Removing $pwd/aot directory..."
# rm -rf "$pwd/aot"
# echo "Running AOT build script..."
# npm run build:aot

echo 'Updating git...'
git add . && git commit -m 'Publishing latest version to npm' && git push -f origin master

echo 'Updating npm package version patch...'
npm version patch

echo 'Checking for dist/ directory...'
[ -d ./dist ] || echo 'Creating dist/ directory...' && mkdir ./dist

echo 'Copying package.json to dist/...'
cp ./package.json ./dist/package.json 
cp ./README.md ./dist/README.md

echo 'Copying bin/ to dist/...';
cp -r ./bin ./dist/bin

echo 'Changing directory into dist/...'
cd ./dist

echo 'Publishing to NPM...'
npm publish --access public

echo 'Publish successful.'