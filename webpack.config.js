const webpack = require('webpack');
const path = require('path');
const glob = require("glob");

const isProduction = true

// solve the problem of promise compliation
let plugins = [new webpack.IgnorePlugin(/vertx/)];

if (isProduction) {
  plugins.push(new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify('production')
    }
  }));
  plugins.push(new webpack.optimize.UglifyJsPlugin());
}

const basicConfig = {
  module: {
    rules: [
      {
        test: /\.js.*/,
        exclude: /node\_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              // plugins: [require.resolve('babel-plugin-transform-runtime')],
              presets: ['es2015', 'stage-2'],
              // presets: ['env'],
              // plugins: [
              //   'transform-regenerator',
              //   ["transform-runtime", {
              //     "polyfill": true,
              //     "regenerator": true
              //   }]
              // ]
            },

          }
        ]
      }
    ]
  },
  plugins: plugins
}
const configs = [
  Object.assign({
    entry: './src/createSingleHtml.js',
    output: {
      path: path.resolve(__dirname, 'dist/'),
      filename: 'createSingleHtml.js'
    }
  }, basicConfig)
].concat(
  isProduction ? []: getTestConfigs(basicConfig)
  )

module.exports = configs


/**
 * multiple entries and relevant multiple outputs
 */
function getTestConfigs(basicConfig) {
  let configs = []
  glob.sync('./src/**/_tests/**.js').map(src => {
    const dir = /.*?\_tests\//.exec(src)[0]
    const outputDir = dir.replace('src', 'dist')
    const filename = src.replace(/.*\_tests\//, '')
    configs.push(Object.assign({
      entry: src,
      output: {
        path: path.resolve(__dirname, outputDir),
        filename: filename
      },
      target: 'node',
      resolve: {
        alias: {
          GlobalConfig: path.resolve(__dirname, 'GlobalConfig.js'),
          UnitTester: path.resolve(__dirname, 'UnitTester.js')
        }
      }

    }, basicConfig))
  })
  return configs
}
