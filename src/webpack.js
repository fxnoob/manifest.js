const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

function getFileNameFromPath(filePath) {
  // Split the filePath by directory separator
  const parts = filePath.split(/[\\/]/);
  // Extract the last part which represents the filename
  return parts[parts.length - 1];
}

function baseWebpackConfig({ fileName, entryPath, outputPath }, options = {}) {
  const currentDir = process.cwd();
  const config = {
    plugins: [],
    entry: entryPath,
    output: {
      filename: fileName,
      path: outputPath,
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          use: [
            {
              loader: 'source-map-loader',
            },
            {
              loader: 'babel-loader',
              options: { presets: ['@babel/env', '@babel/preset-react'] },
            },
          ],
          exclude: /node_modules/,
        },
        {
          test: /\.(css|scss)$/,
          // in the `src` directory
          use: [
            {
              loader: 'style-loader',
            },
            {
              loader: 'css-loader',
            },
            // {
            //   loader: 'sass-loader',
            //   options: {
            //     sourceMap: true,
            //   },
            // },
          ],
        },
        {
          test: /\.(gif|png|jpe?g|svg)$/i,
          type: 'asset/resource',
        },
      ],
    },
    resolve: {
      extensions: ['.mjs', '*', '.js', '.jsx', '.css', '.json'],
    },
  };
  if (options.watch) {
    config.watch = true;
    config.watchOptions = {
      ignored: /node_modules/,
      aggregateTimeout: 300, // Delay in milliseconds before rebuilding
      poll: 1000, // Check for changes every second
    };
  }
  if (options.syncDir) {
    config.plugins.push(
      new CopyWebpackPlugin({
        patterns: [
          {
            from: currentDir,
            to: `${currentDir}/dist`,
            force: true,
            filter: async (resourcePath) => {
              return (
                resourcePath.indexOf(`${currentDir}/node_modules`) === -1 &&
                resourcePath.indexOf(`${currentDir}/dist`) === -1
              );
            },
          },
        ],
      })
    );
  }
  return config;
}

const buildWebpack = async (compiler, options) => {
  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) {
        return reject(err);
      }
      if (stats.hasErrors()) {
        console.log(stats.compilation.errors);
        process.exit(0);
        return reject('Error');
      }
      resolve(stats);
    });
  });
};

async function buildScripts(csArray, options) {
  const baseConfigArray = csArray.map((filePath) => {
    const outputPath = process.cwd();
    return baseWebpackConfig(
      {
        fileName: getFileNameFromPath(filePath),
        entryPath: `./${getFileNameFromPath(filePath)}`,
        outputPath: outputPath + '/dist',
      },
      options
    );
  });
  const promises = baseConfigArray.map((baseConfig) =>
    buildWebpack(webpack(baseConfig))
  );
  const responses = await Promise.all(promises);
}

exports.buildScripts = buildScripts;
