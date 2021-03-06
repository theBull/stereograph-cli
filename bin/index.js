#!/usr/bin/env node --harmony

const co = require('co');
const prompt = require('co-prompt');
const program = require('commander');
const sgNew = require('./sg-new');
const sgServe = require('./sg-serve');
const sgUpdate = require('./sg-update');
const sgVersion = require('./sg-version');
const sgDebug = require('./sg-debug');

program
  .usage('[options] | <cmd> [name] <options>')
  // New
  .command('new <name>', 'Creates a new project with the given name')
  .arguments('<cmd> [name]')
  .option('-T, --title <title>', 'Sets the title of the project with the given value')
  
  // Serve
  .command('serve', 'Runs a development server with browser-sync')
  .option('-p, --port <port>', 'Runs the development server at the given port')

  // Update
  .command('update', 'Updates the global installation of Stereograph CLI with npm')

  // Version
  .command('version', 'Outputs the version of Stereograph CLI')

  // Debug
  .command('debug', 'Change directory into the Stereograph CLI debug directory')

  // Global options
  .option('-d, --debug', 'Runs the command in debug mode.')
  .option('-V, --verbose', 'Run the command with verbose logging')
  
  .action(function(cmd, name) {
    
    if (typeof cmd === 'undefined') {
      console.error('no command given!');
      process.exit(1);
    }
    
    switch(cmd) {
      
      // New
      case 'new':
        sgNew(name, program.title, program.debug, program.verbose);
        break;
      
      // Serve
      case 'serve':
        let port = program.port;
        if(port) {
          port = parseInt(port, 10);
        }
        sgServe(port, program.debug, program.verbose);
        break;
      
      // Update
      case 'update':
        sgUpdate(program.debug, program.verbose);
        break;

      // Version
      case 'version':
        sgVersion();
        break;

      // Debug
      case 'debug':
        sgDebug(program.verbose);
        break;

      default:
        console.error(`The command ${cmd} does not exist.`);
        program.outputHelp();
    }
  })
  .parse(process.argv);

   
