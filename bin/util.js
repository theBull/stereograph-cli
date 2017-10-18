const fs = require('fs');

module.exports = {
  overwritePackageJson: function(package_json_file, data, callback) {
    fs.writeFile(
      package_json_file, 
      JSON.stringify(data, null, "\t"), 
      'utf8', () => {
        callback();
    });
  },
  isBoolean: function(value) {
    return value === true || value === false;
  },
  isNumber: function(value) {
    return typeof value === 'number';
  },
  isPositive: function(value) {
    return this.isNumber(value) && value > 0;
  }
}