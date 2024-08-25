const fs = require('fs')
const path = require('path')
const prettier = require('prettier')
const semver = require('semver')

// Function to get the appropriate parser based on file extension
const getParser = (filePath) => {
  if (filePath.endsWith('.js')) {
    return 'babel'
  }
  if (filePath.endsWith('.ts')) {
    return 'typescript'
  }
  if (filePath.endsWith('.json')) {
    return 'json'
  }
  if (filePath.endsWith('.md')) {
    return 'markdown'
  }
  if (filePath.endsWith('.html')) {
    return 'html'
  }
  if (filePath.endsWith('.css')) {
    return 'css'
  }
  if (filePath.endsWith('.scss')) {
    return 'scss'
  }
  return null // Return null if the file type is unsupported
}

// Function to format a file
const formatFile = async (filePath, options) => {
  const fileContent = fs.readFileSync(filePath, 'utf8')

  // Get Prettier configuration if any, otherwise use options
  const prettierOptions = {
    semi: true,
    singleQuote: true,
    ...options,
  }

  const formatted = await prettier.format(fileContent, prettierOptions)
  fs.writeFileSync(filePath, formatted)
  console.log(`Formatted ${filePath}`)
}

// Function to walk through directories
const walkDir = async (dir) => {
  const files = fs.readdirSync(dir)
  for (const file of files) {
    const parser = getParser(file)
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)
    if (stat.isDirectory() && file !== 'node_modules') {
      await walkDir(filePath) // Recursively walk through subdirectories
    } else if (
      stat.isFile() &&
      (file.endsWith('.js') || file.endsWith('.ts'))
    ) {
      await formatFile(filePath, { parser }) // Format JS/TS files
    }
  }
}

const bumpVersion = (type) => {
  const validTypes = ['patch', 'minor', 'major']
  if (!validTypes.includes(type)) {
    console.error(
      'Invalid version type. Please specify "patch", "minor", or "major".',
    )
    process.exit(1)
  }
  const packageJsonPath = path.resolve(process.cwd(), './manifest.json')
  const packageJson = require(packageJsonPath)
  const currentVersion = packageJson.version
  const newVersion = semver.inc(currentVersion, type)
  if (!semver.valid(newVersion)) {
    console.error(
      'Invalid version format. Please use format: major.minor.patch',
    )
    process.exit(1)
  }
  packageJson.version = newVersion
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))
}

exports.getParser = getParser
exports.formatFile = formatFile
exports.walkDir = walkDir
exports.bumpVersion = bumpVersion
