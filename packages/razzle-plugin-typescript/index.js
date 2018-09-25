'use strict';

const { babelLoaderFinder, eslintLoaderFinder } = require('./helpers');

const defaultOptions = {
  useEslint: true,
};

function modify(baseConfig, args, webpack, userOptions = {}) {
  const { target, dev } = args
  console.log(args)
  const options = Object.assign({}, defaultOptions, userOptions);
  const config = Object.assign({}, baseConfig);

  console.log(baseConfig, webpack)

  config.resolve.extensions = [...config.resolve.extensions, '.ts', '.tsx'];

  if (!options.useEslint) {
    // Locate eslint-loader and remove it (we're using only tslint)
    config.module.rules = config.module.rules.filter(
      rule => !eslintLoaderFinder(rule)
    );
  }

  // Safely locate Babel-Loader in Razzle's webpack internals
  const babelLoader = config.module.rules.find(babelLoaderFinder);
  if (!babelLoader) {
    throw new Error(
      `'babel-loader' was erased from config, we need it to define 'include' option for 'ts-loader'`
    );
  }

  console.log(JSON.stringify(babelLoader, null, 2))
  babelLoader.use[0].options.presets.push('@babel/typescript')

  babelLoader.test = /\.(ts|js)x?$/

  if (target === 'web') {
    if (dev) {
      // As suggested by Microsoft's Outlook team, these optimizations
      // crank up Webpack x TypeScript perf.
      // @see https://medium.com/@kenneth_chau/speeding-up-webpack-typescript-incremental-builds-by-7x-3912ba4c1d15
      config.output.pathinfo = false;
      config.optimization = {
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
      };
    }
  }

  return config;
}

module.exports = modify;
