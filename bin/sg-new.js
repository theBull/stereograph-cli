const shell = require('shelljs');
const fs = require('fs-extra');
const Util = require('./util');
const CONST = require('./sg-constants');
const CWD = process.cwd();

module.exports = function(name, title, debug, verbose) {

  if(!name) {
    console.error(`Name is not defined.`);
    process.exit(1);
  }

  const project_title = title || CONST.INDEX_TITLE_DEFAULT;

  console.log();
  console.log('-------------------------------------------------');
  console.log('Stereograph CLI (new)');
  console.log();
  shell.exec('printf "User: " && whoami');
  console.log(`Project: ${name}`);
  console.log(`Title: "${project_title}"`);
  console.log('-------------------------------------------------');
  console.log();
  debug && console.log(`=== DEBUG MODE ON ===`);
  verbose && console.log(`=== VERBOSE MODE ON ===`);
  console.log();

  const output_dir = `${Util.getOutputPath(debug)}/${name}`;

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

      // Juuuuust in case.
      if(output_dir === '/') {
        process.exit(1);
      }

      shell.exec(`rm -rf ${output_dir}`);
        
      verbose && console.log(`Removed directory: ${output_dir}`);
      verbose && console.log('Continuing...');

      // Ok, continue...
      copy_boilerplate_to_new(name, project_title, output_dir, debug, verbose);

    } else {
      console.error('The following directory exists, cancelling...');
      console.error(output_dir);
      process.exit(1);
    }

  } else {
    // Ok, continue...
    verbose && console.log('Continuing...');
    copy_boilerplate_to_new(name, project_title, output_dir, debug, verbose);
  }
}

function copy_boilerplate_to_new(name, project_title, output_dir, debug, verbose) {
  console.log(`Project directory: ${output_dir}`);
  
  // copy the boilerplate project into the new directory with the given name
  verbose && console.log(`Copying boilerplate from: ${__dirname}/boilerplate...`);
  verbose && console.log(`Copying boilerplate to ${output_dir}...`);

  // do not attempt to copy node_modules
  fs.copy(`${__dirname}/boilerplate`, output_dir, {
    filter: (path) => { 
      verbose && console.log(`Checking path: path`);
      return path.indexOf('node_modules') < 0;
    }
  }, (err) => {

    if(err) {
      console.log('An error occurred while trying to copy the boilerplate project.');
      console.error(err);
      process.exit(1);
    }

    verbose && console.log('Done copying boilerplate.');
    verbose && shell.exec(`ls ${output_dir}`);

    // Boilerplate code has been copied over...
    // Update the package json file
    update_package_json(name, project_title, output_dir, debug, verbose);

  });
}

function update_package_json(name, project_title, output_dir, debug, verbose) {
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
    Util.overwritePackageJson(package_json_file, package_json, () => {
      verbose && console.log('Done.');

      update_index_title(project_title, output_dir, verbose, () => {

        // The new project folder is setup, finish things up
        finish_project_setup(output_dir, debug, verbose);

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
      const index_file = `${output_dir}/${CONST.INDEX_HTML}`;
      verbose && console.log(`Updating title element: ${index_file} ...`);

      // open and read the index.html file
      fs.readFile(index_file, 'utf8', (html_err, html_data) => {
        if(html_err) {
          console.error('An error occurred while trying to update index.html title');
          console.log(err);
          exit(1);
        }

        verbose && console.log(`Setting the title to: "${project_title}" ...`);
        var regex = new RegExp(CONST.INDEX_TITLE_KEY, "g");
        var result = html_data.replace(regex, project_title);
        
        // update the title token with the given title
        fs.writeFile(index_file, result, 'utf8', (html_title_err) => {
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

function finish_project_setup(output_dir, debug, verbose) {
  // Not verbose
  console.log('Installing npm packages...');

  // if in debug or verbose, prefix npm install with time command to
  // output diagnostics for install performance
  shell.exec(`cd ${output_dir} && ${debug || verbose ? 'time' : ''} yarn`);
  
  console.log('Done.');
  console.log();
  console.log('\tRun this command to change into the new project directory:');
  console.log(`\tcd ${output_dir}`);
  console.log();
}