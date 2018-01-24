const fs = require('fs');
const CONST = require('./sg-constants');

module.exports = class Util {
  static overwritePackageJson(package_json_file, data, callback) {
    fs.writeFile(
      package_json_file, 
      JSON.stringify(data, null, "\t"), 
      'utf8', () => {
        callback();
    });
  }

  static isBoolean(value) {
    return value === true || value === false;
  }

  static isNumber(value) {
    return typeof value === 'number';
  }

  static isPositive(value) {
    return this.isNumber(value) && value > 0;
  }

  static getDebugDir() {
    return `${__dirname}/${CONST.DEBUG_DIR}`;
  }

  static getOutputPath(debug) {
    return debug ? this.getDebugDir() : process.cwd();
  }
}