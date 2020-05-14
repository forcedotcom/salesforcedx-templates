const path = require('path');
const glob = require('glob');
const BASE_DIR = path.resolve(__dirname);

const getEntryObject = () => {
  // const entryArray = glob.sync('src/utils/**/**/**/*.ts');
  const entryArray = glob.sync('src/**/**/**/**/*.ts');
  const srcObj = entryArray.reduce((acc, item) => {
    const outputModulePath = path.join(
      'lib',
      item.replace('src', '').replace('.ts', '')
    );
    acc[outputModulePath] = path.join(BASE_DIR, item);
    return acc;
  }, {});
  return srcObj;
};

const getMode = () => {
  const webpackMode = process.env.NODE_ENV || 'development';
  console.log(`Running in ${webpackMode} mode`);
  return webpackMode;
};

module.exports = {
  // extensions run in a node context
  target: 'node',
  node: { __dirname: false, __filename: true },
  mode: getMode(),
  entry: getEntryObject(),
  output: {
    path: BASE_DIR,
    filename: '[name].js',
    libraryTarget: 'commonjs'
  },
  // include source maps
  devtool: 'source-map',
  // excluding dependencies from getting bundled
  externals: {
    '@oclif/command': '@oclif/command',
    '@oclif/config': '@oclif/config',
    '@oclif/errors': '@oclif/errors',
    '@salesforce/core': '@salesforce/core',
    '@salesforce/command': '@salesforce/command',
    'yeoman-generator': 'yeoman-generator'
  },
  // Automatically resolve certain extensions.
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  // pre-process certain file types using loaders
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules|\.d\.ts$/,
        use: [
          {
            loader: 'ts-loader'
          }
        ]
      },
      {
        test: /^.*templateCommand\.js$/,
        loader: 'string-replace-loader',
        include: path.join(__dirname, 'node_modules/yeoman-environment/lib'),
        query: {
          search: 'const yeoman = require(path);',
          replace: 'const yeoman = require("./originalRequire")(path);'
        }
      }
    ]
  }
};
