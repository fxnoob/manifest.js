#!/usr/bin/env node
const fs = require('fs');
const semver = require('semver');
const path = require('path');
const { program } = require('commander');
const { Builder } = require('./src/builder');

program.version('0.0.8').description('A browser extension builder toolchain');

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

program
  .command('version <type>')
  .description('Bump the manifest.json version')
  .action((type) => {
    const validTypes = ['patch', 'minor', 'major'];

    if (!validTypes.includes(type)) {
      console.error(
        'Invalid version type. Please specify "patch", "minor", or "major".'
      );
      process.exit(1);
    }
    const packageJsonPath = path.resolve(process.cwd(), './manifest.json');
    const packageJson = require(packageJsonPath);
    const currentVersion = packageJson.version;
    const newVersion = semver.inc(currentVersion, type);
    if (!semver.valid(newVersion)) {
      console.error(
        'Invalid version format. Please use format: major.minor.patch'
      );
      process.exit(1);
    }
    packageJson.version = newVersion;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  });

program.parse(process.argv);
