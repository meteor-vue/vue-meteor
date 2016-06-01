Package.describe({
  name: 'akryum:vue-component',
  version: '0.0.3',
  summary: 'VueJS single-file components',
  git: 'https://github.com/Akryum/meteor-vue-component',
  documentation: 'README.md'
});

Package.registerBuildPlugin({
  name: "vue-component",
  use: [
    'ecmascript@0.4.3',
    'caching-compiler@1.0.4',
    'babel-compiler@6.6.4'
  ],
  sources: [
    'plugin/throw-compile-error.js',
    'plugin/post-css.js',
    'plugin/tag-scanner.js',
    'plugin/tag-handler.js',
    'plugin/vue-compiler.js',
    'plugin/plugin.js'
  ],
  npmDependencies: {
    'postcss': '5.0.21',
    'postcss-selector-parser': '2.0.0'
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
