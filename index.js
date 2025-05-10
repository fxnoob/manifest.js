const fs = require('fs');
const semver = require('semver');
const path = require('path');
const { Command } = require('commander');
const prettier = require('prettier');

const { Builder } = require('./src/builder');
const translateCommand = require('@fxnoob/translate');
const { pubsub, PubSub } = require('./src/pubsub');
const pkg = require('./package.json');

const subProgram = new Command('manifest');

subProgram
  .version(pkg.version)
  .description('A browser extension builder toolchain');

subProgram
  .command('build')
  .option('--watch', 'run program in watch mode.')
  .description('build bundle for browser to load from.')
  .action(async (options) => {
    try {
      const manifestContent = fs.readFileSync(
        `${process.cwd()}/manifest.json`,
        'utf8',
      );
      const manifestJson = JSON.parse(manifestContent);
      const builder = new Builder(manifestJson, options);
      await builder.build();
    } catch (e) {
      throw new Error(e.message);
    }
  });

subProgram
  .command('version <type>')
  .description('Bump the manifest.json version')
  .action((type) => {
    const validTypes = ['patch', 'minor', 'major'];

    if (!validTypes.includes(type)) {
      console.error(
        'Invalid version type. Please specify "patch", "minor", or "major".',
      );
      process.exit(1);
    }
    const packageJsonPath = path.resolve(process.cwd(), './manifest.json');
    const packageJson = require(packageJsonPath);
    const currentVersion = packageJson.version;
    const newVersion = semver.inc(currentVersion, type);
    if (!semver.valid(newVersion)) {
      console.error(
        'Invalid version format. Please use format: major.minor.patch',
      );
      process.exit(1);
    }
    packageJson.version = newVersion;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  });

subProgram
  .command('format')
  .description('Format current directory recursively')
  .action(async (options) => {
    // Use async function to handle potential async operations
    const dirPath = process.cwd();

    if (!fs.existsSync(dirPath)) {
      // console.log(chalk.red(`Directory ${dirPath} does not exist.`));
      process.exit(1);
    }
    // Function to get the appropriate parser based on file extension
    const getParser = (filePath) => {
      if (filePath.endsWith('.js')) {
        return 'babel';
      }
      if (filePath.endsWith('.ts')) {
        return 'typescript';
      }
      if (filePath.endsWith('.json')) {
        return 'json';
      }
      if (filePath.endsWith('.md')) {
        return 'markdown';
      }
      if (filePath.endsWith('.html')) {
        return 'html';
      }
      if (filePath.endsWith('.css')) {
        return 'css';
      }
      if (filePath.endsWith('.scss')) {
        return 'scss';
      }
      return null; // Return null if the file type is unsupported
    };

    // Function to format a file
    const formatFile = async (filePath, options) => {
      const fileContent = fs.readFileSync(filePath, 'utf8');

      // Get Prettier configuration if any, otherwise use options
      const prettierOptions = {
        semi: true,
        singleQuote: true,
        ...options,
      };

      const formatted = await prettier.format(fileContent, prettierOptions);
      fs.writeFileSync(filePath, formatted);
      console.log(`Formatted ${filePath}`);
    };

    // Function to walk through directories
    const walkDir = (dir) => {
      const files = fs.readdirSync(dir);

      for (const file of files) {
        const parser = getParser(file);
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory() && file !== 'node_modules') {
          walkDir(filePath); // Recursively walk through subdirectories
        } else if (
          stat.isFile() &&
          (file.endsWith('.js') || file.endsWith('.ts'))
        ) {
          formatFile(filePath, { parser }); // Format JS/TS files
        }
      }
    };

    walkDir(dirPath);
  });

subProgram.addCommand(translateCommand);

// Export the command-line program
module.exports = subProgram;

// Export the pubsub library
module.exports.pubsub = pubsub;
module.exports.PubSub = PubSub;
