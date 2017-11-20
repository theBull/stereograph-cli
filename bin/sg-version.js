const shell = require('shelljs');

module.exports = function() {
  shell.exec('npm show @stereograph/cli version');
}