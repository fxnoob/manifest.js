const fs = require('fs');
const DotEnv = require('dotenv');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { join } = require('path');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

const projectRootPath = join(__dirname, '../node_modules');

function getFileNameFromPath(filePath) {
  // Split the filePath by directory separator
  const parts = filePath.split(/[\\/]/);
  // Extract the last part which represents the filename
  return parts[parts.length - 1];
}

function getLocalEnv() {
  const dotenvPath = join(process.cwd(), './.env');
  if (fs.existsSync(dotenvPath)) {
    return DotEnv.config({ path: dotenvPath });
  }
  return false;
}

function baseWebpackConfig({ fileName, entryPath, outputPath }, options = {}) {
  console.log({ projectRootPath });
  const currentDir = process.cwd();
  const config = {
    plugins: [
      // default plugins
      new NodePolyfillPlugin(),
    ],
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
              loader: require.resolve('babel-loader', {
                paths: [projectRootPath],
              }),
              options: {
                presets: [
                  require.resolve('@babel/preset-env', {
                    paths: [projectRootPath],
                  }),
                  require.resolve('@babel/preset-react', {
                    paths: [projectRootPath],
                  }),
                ],
                plugins: [
                  [
                    require.resolve('@babel/plugin-transform-runtime', {
                      paths: [projectRootPath],
                    }),
                  ],
                  [
                    require.resolve('@babel/plugin-proposal-class-properties', {
                      paths: [projectRootPath],
                    }),
                  ],
                  [
                    require.resolve('@babel/plugin-syntax-class-properties', {
                      paths: [projectRootPath],
                    }),
                  ],
                  [
                    require.resolve('@babel/plugin-syntax-dynamic-import', {
                      paths: [projectRootPath],
                    }),
                  ],
                  [
                    require.resolve('@babel/plugin-transform-react-jsx', {
                      paths: [projectRootPath],
                    }),
                  ],
                ],
              },
            },
          ],
          exclude: /node_modules|\.git/,
        },
        {
          test: /\.(css|scss)$/,
          // in the `src` directory
          use: [
            {
              loader: require.resolve('style-loader', {
                paths: [projectRootPath],
              }),
            },
            {
              loader: require.resolve('css-loader', {
                paths: [projectRootPath],
              }),
            },
            // {
            //   loader: 'sass-loader',
            //   options: {
            //     sourceMap: true,
            //   },
            // },
          ],
          exclude: /node_modules|\.git/,
        },
        {
          test: /\.(gif|png|jpe?g|svg)$/i,
          use: [
            'file-loader',
            {
              loader: require.resolve('image-webpack-loader', {
                paths: [projectRootPath],
              }),
              options: {
                bypassOnDebug: true, // webpack@1.x
                disable: true, // webpack@2.x and newer
              },
            },
          ],
          exclude: /node_modules|\.git/,
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
  const env = getLocalEnv();
  if (env) {
    config.plugins.push(
      new webpack.DefinePlugin({
        'process.env': JSON.stringify({ ...options, ...env.parsed }),
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
        console.error(stats.compilation.errors);
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
