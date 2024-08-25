const fs = require('fs')
const { Command } = require('commander')
const translateCommand = require('@fxnoob/translate')

const { Builder } = require('./src/builder')
const pkg = require('./package.json')
const helper = require('./src/helper')

const subProgram = new Command('manifest')

subProgram
  .version(pkg.version)
  .description('A browser extension builder toolchain')

subProgram
  .command('build')
  .option('--watch', 'run program in watch mode.')
  .description('build bundle for browser to load from.')
  .action(async (options) => {
    try {
      const manifestContent = fs.readFileSync(
        `${process.cwd()}/manifest.json`,
        'utf8',
      )
      const manifestJson = JSON.parse(manifestContent)
      const builder = new Builder(manifestJson, options)
      await builder.build()
    } catch (e) {
      throw new Error(e.message)
    }
  })

subProgram
  .command('version <type>')
  .description('Bump the manifest.json version')
  .action((type) => {
    helper.bumpVersion(type)
  })

subProgram
  .command('format')
  .description('Format current directory recursively')
  .action(async (options) => {
    const dirPath = process.cwd()
    await helper.walkDir(dirPath)
  })

subProgram.addCommand(translateCommand)

module.exports = subProgram
