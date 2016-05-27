Package.describe({
  name: 'akryum:vue-component',
  version: '0.0.1',
  summary: 'VueJS single-file components',
  git: 'https://github.com/Akryum/meteor-vue-component',
  documentation: 'README.md'
});

Package.registerBuildPlugin({
  name: "compileVueComponents",
  use: [
    'ecmascript@0.4.3',
    'caching-compiler@1.0.4',
    'babel-compiler@6.6.4',
    'akryum:postcss@0.0.1'
  ],
  sources: [
    'plugin/throw-compile-error.js',
    'plugin/tag-scanner.js',
    'plugin/tag-handler.js',
    'plugin/vue-compiler.js',
    'plugin/plugin.js'
  ],
  npmDependencies: {
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
