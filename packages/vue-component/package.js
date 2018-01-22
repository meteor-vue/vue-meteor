Package.describe({
  name: 'akryum:vue-component',
  version: '0.12.3',
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
    'templating-tools@1.1.2',
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
    'postcss': '5.2.17',
    'postcss-load-config': '1.2.0',
    'postcss-selector-parser': '2.2.3',
    'postcss-modules': '0.6.4',
    'socket.io': '2.0.4',
    'async': '2.5.0',
    'lodash': '4.17.4',
    'hash-sum': '1.0.2',
    'source-map': '0.6.1',
    'source-map-merger': '0.2.0',
    'generate-source-map': '0.0.5',
    'autoprefixer': '6.7.7',
    'vue-template-compiler': '2.5.8',
    'vue-template-es2015-compiler': '1.6.0',
    'parse5': '3.0.2',
    'colors': '1.1.2',
  }
});

Package.onUse(function(api) {
  api.versionsFrom('1.4.2');
  api.use('isobuild:compiler-plugin@1.0.0');
  api.use('akryum:vue-component-dev-server@0.0.11');
  api.use('akryum:vue-component-dev-client@0.3.0');
});
