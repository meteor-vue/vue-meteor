Package.describe({
  name: 'akryum:vue-component',
  version: '0.7.6',
  summary: 'VueJS single-file components that hot-reloads',
  git: 'https://github.com/Akryum/meteor-vue-component',
  documentation: 'README.md'
});

Package.registerBuildPlugin({
  name: "vue-component",
  use: [
    'ecmascript@0.4.4',
    'caching-compiler@1.0.5',
    'babel-compiler@6.8.0'
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
    'vue-template-compiler': '2.0.0-rc.8'
  }
});

Package.onUse(function(api) {
  api.versionsFrom('1.3.3');
  api.use('isobuild:compiler-plugin@1.0.0');
  api.use('akryum:vue-component-dev-server@0.0.2');
  api.use('akryum:vue-component-dev-client@0.2.0');
});
