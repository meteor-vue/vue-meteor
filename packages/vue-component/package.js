Package.describe({
  name: 'akryum:vue-component',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: '',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.registerBuildPlugin({
  name: "compileVueComponents",
  use: [
    'ecmascript',
    'caching-compiler',
    'babel-compiler'
  ],
  sources: [
    'plugin/throw-compile-error.js',
    'plugin/tag-scanner.js',
    'plugin/tag-handler.js',
    'plugin/vue-compiler.js',
    'plugin/plugin.js'
  ],
  npmDependencies: {
    "source-map": "0.5.3",
    "multi-stage-sourcemap": "0.2.1"
  }
});

Package.onUse(function(api) {
  api.use('isobuild:compiler-plugin@1.0.0');
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('akryum:vue-component');
  api.mainModule('vue-component-tests.js');
});
