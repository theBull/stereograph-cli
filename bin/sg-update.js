const shell = require('shelljs');

module.exports = function(debug, verbose) {
  console.log('To update @stereograph/cli to the latest version, run the following command: ');
  console.log('');
  console.log('\tnpm install -g @stereograph/cli@latest');
  console.log('');
}