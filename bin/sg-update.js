const shell = require('shelljs');

module.exports = function(debug, verbose) {
  if(debug) {
    console.log('NOTIFY ONLY: Updating stereograph cli. Debug mode is enabled and update will not run.');
    return;
  }

  verbose && console.log('Updating stereograph cli to latest published npm version.');
  
  shell.exec(`echo "Updating from: " && npm show @stereograph/cli version`);
  shell.exec(`npm install -g @stereograph/cli@latest`);
  
  verbose && console.log('Done.');
}