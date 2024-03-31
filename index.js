#!/usr/bin/env node
const fs = require('fs');
const { program } = require('commander');
const { Builder } = require('./src/builder');
const pkg = require('./package.json');

program
  .version(pkg.version)
  .description('A browser extension builder toolchain');

program
  .command('build')
  .option('--watch', 'run program in watch mode.')
  .description('build bundle for browser to load from.')
  .action(async (options) => {
    try {
      const manifestContent = fs.readFileSync(
        `${process.cwd()}/manifest.json`,
        'utf8'
      );
      const manifestJson = JSON.parse(manifestContent);
      const builder = new Builder(manifestJson, options);
      await builder.build();
    } catch (e) {
      throw new Error(e.message);
    }
  });

program.parse(process.argv);