const shell = require('shelljs');
const CWD = process.cwd();
const fs = require('fs');
const Util = require('./util');
const CONST = require('./sg-constants');

module.exports = function(port, debug, verbose) {

  fs.readFile(`${CWD}/sg-config.json`, 'utf8', (err, data) => {
    if(err) {
      console.error(`sg-config.json does not exist in ${CWD}...exiting.`);
      process.exit(1);
    }
    verbose && console.log('Reading sg-config.json...');

    const sg_config_json = JSON.parse(data);
    verbose && console.log(sg_config_json);
    const server_cmd = build_server_cmd(sg_config_json.server, port, verbose);
    
    // Update package.json and run...
    const package_json_file = `${CWD}/package.json`;
    verbose && console.log(`Reading package.json file to perform updates: ${package_json_file}...`);
    fs.readFile(package_json_file, 'utf8', (pjErr, pjData) => {
      if(pjErr) {
        console.error(pjErr);
        process.exit(1);
      }

      // read package.json and update script with server command...
      const package_json = JSON.parse(pjData);
      verbose && console.log(package_json);
      package_json.scripts.serve = server_cmd;
      verbose && console.log('Updating package.json scripts with server start command...');
      Util.overwritePackageJson(package_json_file, package_json, () => {
        verbose && shell.exec(`echo "Executing command: " ${server_cmd} ...`);
        verbose && console.log('Done.');

        // --- *** ---
        //
        // The server run command is ready to go.
        // Call it.
        // This starts the server.
        //
        // --- *** ---
        shell.exec(`npm run serve`);
      });
    });
  });
}

/**
 * Builds the browser-sync start command, reading options in from sg-config.json and
 * passing those in as arguments. https://www.browsersync.io/docs/command-line
 * @param {*} server_json 
 * @param {*} port 
 * @param {*} verbose 
 */
function build_server_cmd(server_json, port, verbose) {
  if(!server_json) {
    console.error('Invalid sg-config.json: "server" property is missing. Exiting...');
    process.exit(1);
  }
  if(port) {
    if(!Util.isNumber(port)) {
      console.error('Invalid port number: Port must be a number. Exiting...');
      process.exit(1);
    } else if(port <= 0) {
      console.error('Invalid port number: Port must be greater than zero (0). Exiting...');
      process.exit(1);
    }
    verbose && console.log(`Overriding server port (if specified in sg-config.json): ${port} ...`);
  }

  // ---
  // REQUIRED PROPERTIES:
  // Handle invalid / missing required properties
  // ---
  let invalid_config = false;
  if(!server_json.hasOwnProperty('start') || !server_json.start) {
    console.error('Invalid sg-config.json: Required "start" property is missing from "server" property. Exiting...');
    invalid_config = true;
  }
  if(!server_json.hasOwnProperty('app') || !server_json.app) {
    console.error('Invalid sg-config.json: Required "app" property is missing from "server" property. Exiting...');
    invalid_config = true;
  }

  // ---
  // OPTIONAL PROPERTIES:
  // Handle invalid / missing optional properties
  // ---
  if(server_json.hasOwnProperty('watch') && !Util.isBoolean(server_json.watch)) {
    console.error('Invalid sg-config.json: Optional "watch" property must be a boolean value of true or false if specified in "server" property. Exiting...');
    invalid_config = true;
  }
  if(server_json.hasOwnProperty('open') && !Util.isBoolean(server_json.open)) {
    console.error('Invalid sg-config.json: Optional "open" property must be a boolean value of true or false if specified in "server" property. Exiting...');
    invalid_config = true;
  }
  if(server_json.hasOwnProperty('port') && !Util.isPositive(server_json.port)) {
    console.error('Invalid sg-config.json: Optional "port" property must be a number (greater than zero) if specified in the "server" property. Exiting...');
    invalid_config = true;
  }
  if(invalid_config) {
    process.exit(1);
  }

  // ---
  // Insert default values if not present
  // --
  if(!server_json.hasOwnProperty('watch')) {
    // watch for file changes by default
    server_json.watch = true;
  }
  if(port) {
    // set to port value passed in
    server_json.port = port;
  } else if(!server_json.hasOwnProperty('port')) {
    // use default cli-specified port if no port passed in `sg serve --port` command,
    // and if no port is specified in sg-config.json
    server_json.port = CONST.DEFAULT_SERVER_PORT;
  }

  let cmd = server_json.start;
  verbose && console.log(`Building command (initial): ${cmd}`);
  for(let flag in server_json) {
    if(!server_json.hasOwnProperty(flag)) {
      continue;
    }

    // ignore the start command
    if(flag == 'start') {
      continue;
    }

    const value = server_json[flag];
    if(flag == 'app') {
      // server
      // serve static
      cmd += ` --serveStatic ${value} --server ${value}`;
    } else if(flag == 'watch') {
      if(value === true) {
        cmd += ` --files ${server_json.app}`
      }
    } else if(flag == 'open') {
      if(value) {
        cmd += ` --open true`;
      } else {
        cmd += ` --no-open`;
      }
    } else {
      cmd += ` --${flag} ${value}`;
    }
    
    verbose && console.log(cmd);    
  }
  return cmd;
}