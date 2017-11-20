const CWD = process.cwd();
const shell = require('shelljs');
const fs = require('fs');
const ncp = require('ncp');
const util = require('./util');
const test_dir = debug ? 'debug/' : '';
const output_dir = `${output_path}/${test_dir}${name}`;

module.exports = function(name, debug, verbose) {
  if(!name) {
    console.error(`Name is not defined.`);
    process.exit(1);
  }
  debug && console.log(`=== DEBUG MODE ON ===`);
  verbose && console.log(`=== VERBOSE MODE ON ===`);

  console.log(`Stereograph CLI initializing new project: ${name}`);

  const output_path = debug ? __dirname : CWD;

  console.log(`Project directory: ${output_dir}`);

  // copy the boilerplate project into the new directory with the given name
  verbose && console.log(`Copying boilerplate to ${CWD}/${name}...`);
  ncp(`${__dirname}/boilerplate`, output_dir, (err) => {
    if(err) {
      console.error(err);
      process.exit(1);
    }
    verbose && console.log('Done.');

    const package_json_file = `${output_dir}/package.json`;
    verbose && console.log(`Updating package.json: ${package_json_file}...`);
    fs.readFile(package_json_file, 'utf8', (pjErr, data) => {
      if(pjErr) {
        console.error(pjErr);
        process.exit(1);
      }
      if(!data) {
        console.error('Data could not be read from boilerplate package.json');
        process.exit(1);
      }

      const package_json = JSON.parse(data);
      package_json.name = name;

      // overwrite the boilerplate-copied package.json with updated fields
      util.overwritePackageJson(package_json_file, package_json, () => {
        verbose && console.log('Done.');
        
        // Not verbose
        console.log('Installing npm packages...');
        shell.exec(`cd ${output_dir} && npm install`);
        console.log('Done.');
      });
    });

  });

}