#!/bin/bash

pwd
command -v yarn >/dev/null 2>&1 || { echo >&2 "Stereograph CLI requires yarn but it's not installed. Aborting."; exit 1; }
echo "Stereograph CLI is caching some dependencies. This might take a little while if installing for the first time."
cd ./bin/boilerplate 
echo 'Installing boilerplate node modules with Yarn'
yarn
echo 'Ready to go!'
