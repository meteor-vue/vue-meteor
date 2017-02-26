Package.describe({
  name: 'akryum:vue-component',
  version: '0.8.8',
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
    'postcss': '5.2.15',
    'postcss-selector-parser': '2.2.3',
    'postcss-modules': '0.6.4',
    'socket.io': '1.7.3',
    'async': '2.1.5',
    'lodash': '4.17.4',
    'hash-sum': '1.0.2',
    'source-map': '0.5.6',
    'source-map-merger': '0.2.0',
    'generate-source-map': '0.0.5',
    'autoprefixer': '6.7.5',
    'vue-template-compiler': '2.2.1',
    'vue-template-es2015-compiler': '1.5.1',
  }
});

Package.onUse(function(api) {
  api.versionsFrom('1.4.2');
  api.use('isobuild:compiler-plugin@1.0.0');
  api.use('akryum:vue-component-dev-server@0.0.5');
  api.use('akryum:vue-component-dev-client@0.2.4');
});
