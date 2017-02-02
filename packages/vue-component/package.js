Package.describe({
  name: 'akryum:vue-component',
  version: '0.8.4',
  summary: 'VueJS single-file components that hot-reloads',
  git: 'https://github.com/Akryum/meteor-vue-component',
  documentation: 'README.md'
});

Package.registerBuildPlugin({
  name: "vue-component",
  use: [
    'ecmascript@0.6.1',
    'caching-compiler@1.1.9',
    'babel-compiler@6.13.0',
    'akryum:vue-compiler@2.1.10',
  ],
  sources: [
    'plugin/regexps.js',
    'plugin/utils.js',
    'plugin/dev-server.js',
    'plugin/post-css.js',
    'plugin/tag-scanner.js',
    'plugin/tag-handler.js',
    'plugin/vue-compiler.js',
    'plugin/plugin.js'
  ],
  npmDependencies: {
    'postcss': '5.0.21',
    'postcss-selector-parser': '2.0.0',
    'socket.io': '1.4.6',
    'async': '1.4.0',
    'lodash': '4.13.1',
    'hash-sum': '1.0.2',
    'source-map': '0.5.6',
    'source-map-merger': '0.2.0',
    'generate-source-map': '0.0.5',
    'autoprefixer': '6.6.0',
  }
});

Package.onUse(function(api) {
  api.versionsFrom('1.4.2');
  api.use('isobuild:compiler-plugin@1.0.0');
  api.use('akryum:vue-component-dev-server@0.0.4');
  api.use('akryum:vue-component-dev-client@0.2.3');
});
