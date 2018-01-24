const Util = require('./util');
const shell = require('shelljs');

module.exports = function(verbose) {
  console.log(Util.getDebugDir());
}