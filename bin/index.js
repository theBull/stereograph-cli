#!/usr/bin/env node --harmony

const co = require('co');
const prompt = require('co-prompt');
const program = require('commander');
const sgNew = require('./sg-new');
const sgServe = require('./sg-serve');

program
  .command('new <name>', 'Creates a new project with the given name.')
  .arguments('<cmd> [name]')
  .option('-d --debug', 'Runs the command in debug mode.')
  .option('-v --verbose', 'Run the command with verbose logging')

  .command('serve', 'Runs a development server with browser-sync')
  .option('-p --port <port>', 'Runs the development server at the given port')

  .action(function(cmd, name) {
    
    if (typeof cmd === 'undefined') {
      console.error('no command given!');
      process.exit(1);
    }
    
    switch(cmd) {
      case 'new':
        sgNew(name, program.debug, program.verbose);
        break;
      case 'serve':
        let port = program.port;
        if(port) {
          port = parseInt(port, 10);
        }
        sgServe(port, program.debug, program.verbose);
        break;
      default:
        console.error(`The command ${cmd} does not exist.`);
        program.outputHelp();
    }
  })
  .parse(process.argv);

   
