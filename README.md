# manifest.js

This is a CLI toolchain for building browser extensions. It includes commands for building bundles, managing versions, and translating content. The toolchain is designed to be modular and extendable, making it easy to add new functionality.

## Installation

```shell
npm install manifest.js -g
```

## Usage

This CLI tool provides several commands to help you manage your browser extension project. Below is a detailed explanation of each command.

### 1. Build Command

The `build` command compiles your extension’s code into a bundle that can be loaded into the browser.

#### Syntax:

```bash
manifest build [options]
```

#### Options:

- `--watch`: Run the build process in watch mode. This option automatically rebuilds the bundle whenever a source file changes.

#### Example:

```bash
manifest build --watch
```

This command reads the `manifest.json` file from the current working directory, initializes the `Builder` class with it, and triggers the build process.

### 2. Version Command

The `version` command increments the version number in the `manifest.json` file. You can specify the type of version bump: `patch`, `minor`, or `major`.

#### Syntax:

```bash
manifest version <type>
```

#### Parameters:

- `<type>`: The type of version increment. Valid values are `patch`, `minor`, or `major`.

#### Example:

```bash
manifest version patch
```

This command will increment the patch version (e.g., from `1.0.0` to `1.0.1`) in the `manifest.json` file.

### 3. Translate Command

The `translate` command integrates the translation module into your project. It includes two subcommands: `init` and `sync`.

#### Usage:

```bash
manifest translate <subcommand>
```

#### Subcommands:

- `init`: Initializes the translation configuration by generating a `translate.config.json` file.
- `sync`: Syncs the translations based on the `translate.config.json` file.

#### Example:

```bash
manifest translate init
```

This command creates a `translate.config.json` file if it doesn’t already exist.

```bash
manifest translate sync
```

This command syncs the translations using the configuration file.


### 4. Format Command

#### Usage:

```bash
manifest format
```

## Extending the CLI

This CLI is built using the `commander` library, making it easy to add new commands or extend existing ones. To add a new command:

1. Create a new module in the `src/` directory.
2. Import and register your command in the main command file.

## Error Handling

The CLI provides basic error handling. If an error occurs during execution, it will be thrown, and a message will be displayed in the console.

## Testing

This project uses Jest for testing. The test suite includes tests for the following components:

### Builder Tests
- Constructor initialization
- Setting options
- Extracting pages from manifest
- Extracting content scripts from manifest
- Extracting background scripts from manifest
- Extracting assets (icons, web accessible resources, HTML pages) from manifest
- Extracting popup page scripts from manifest
- Extracting options page scripts from manifest
- Initializing all properties from manifest
- Building all scripts

### Validator Tests
- Validating valid manifests
- Rejecting invalid manifests
- Validating manifests with string default_icon
- Validating minimal manifests without optional fields
- Validating manifests with all allowed permissions
- Rejecting manifests with invalid permissions
- Validating manifests with web_accessible_resources
- Validating manifests with options_page, devtools_page, and chrome_url_overrides

### Webpack Tests
- Building scripts successfully
- Handling webpack compilation errors
- Handling webpack compilation stats errors
- Applying environment variables from .env file
- Handling missing .env file

### Running Tests

To run the tests, use the following command:

```bash
npm test
```

## License

This project is licensed under the MIT License.

See More [Example](https://github.com/fxnoob/image-to-text-ocr)
