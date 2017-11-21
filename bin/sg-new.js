const CWD = process.cwd();
const shell = require('shelljs');
const fs = require('fs');
const ncp = require('ncp');
const util = require('./util');
const rimraf = require('rimraf');
const DEBUG_DIR = 'debug/';
const INDEX_HTML = 'public/index.html';
const INDEX_TITLE_DEFAULT = 'Stereograph App';
const INDEX_TITLE_KEY = '{{sg-title}}';

module.exports = function(name, title, debug, verbose) {

  if(!name) {
    console.error(`Name is not defined.`);
    process.exit(1);
  }

  const project_title = title || INDEX_TITLE_DEFAULT;

  console.log();
  console.log('-------------------------------------------------');
  console.log('Stereograph CLI (new)');
  console.log();
  console.log(`Project: ${name}`);
  console.log(`Title: "${project_title}"`);
  console.log('-------------------------------------------------');
  console.log();
  debug && console.log(`=== DEBUG MODE ON ===`);
  verbose && console.log(`=== VERBOSE MODE ON ===`);
  console.log();

  const output_path = debug ? __dirname : CWD;
  const test_dir = debug ? DEBUG_DIR : '';
  const output_dir = `${output_path}/${test_dir}${name}`;

  // ---
  //
  // Perform cleanup if in debug
  //
  // ---
  // if in debug mode and output_dir exists, overwrite the folder.
  // if not in debug mode, fail gracefully
  if(fs.existsSync(output_dir)) {    
    
    if(debug) {
      verbose && console.log('Directory exists! In debug mode, overwriting directory...');
      verbose && console.log(`Removing directory... ${output_dir}`);

      rimraf(output_dir, function(err) {
        verbose && console.log(`Removed directory: ${output_dir}`);
        verbose && console.log('Continuing...');

        // Ok, continue...
        copy_boilerplate_to_new(name, project_title, output_dir, verbose);
      });      
    } else {
      console.error('The following directory exists, cancelling...');
      console.error(output_dir);
      process.exit(1);
    }

  } else {
    // Ok, continue...
    verbose && console.log('Continuing...');
    copy_boilerplate_to_new(name, project_title, output_dir, verbose);
  }
}

function copy_boilerplate_to_new(name, project_title, output_dir, verbose) {
  console.log(`Project directory: ${output_dir}`);
  
  // copy the boilerplate project into the new directory with the given name
  verbose && console.log(`Copying boilerplate from: ${__dirname}/boilerplate...`);
  verbose && console.log(`Copying boilerplate to ${output_dir}...`);
  ncp(`${__dirname}/boilerplate`, output_dir, (err) => {

    if(err) {
      console.log('An error occurred while trying to copy the boilerplate project.');
      console.error(err);
      process.exit(1);
    }

    verbose && console.log('Done copying boilerplate.');

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

        update_index_title(project_title, output_dir, verbose, function() {
          // Not verbose
          console.log('Installing npm packages...');
          shell.exec(`cd ${output_dir} && npm install`);
          console.log('Done.');
        });
      });
    });

  });
}

function update_index_title(project_title, output_dir, verbose, callback) {
  // ---
    // Handle -T or --title "<project title>" passed in by updating index.html <title> element
    // or update to default title value
    // ---
    if(project_title) {
      const index_file = `${output_dir}/${INDEX_HTML}`;
      verbose && console.log(`Updating title element: ${index_file} ...`);

      // open and read the index.html file
      fs.readFile(index_file, 'utf8', function(html_err, html_data) {
        if(html_err) {
          console.error('An error occurred while trying to update index.html title');
          console.log(err);
          exit(1);
        }

        verbose && console.log(`Setting the title to: "${project_title}" ...`);
        var regex = new RegExp(INDEX_TITLE_KEY, "g");
        var result = html_data.replace(regex, project_title);

        // todo: remove
        verbose && console.log(result);
        
        // update the title token with the given title
        fs.writeFile(index_file, result, 'utf8', function (html_title_err) {
            if (html_title_err) {
              console.log('An error occurred while trying to update title of index.html...');
              console.error(html_title_err);
              exit(1);
            } else {
              verbose && console.log(`Successfully updated index.html title to: "${project_title}"`);
              callback();
            }
        });
      });
    }
}