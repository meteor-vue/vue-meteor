Package.describe({
  name: 'akryum:vue-component',
  version: '0.15.2',
  summary: 'VueJS single-file components that hot-reloads',
  git: 'https://github.com/Akryum/meteor-vue-component',
  documentation: 'README.md',
})

Package.registerBuildPlugin({
  name: 'vue-component',
  use: [
    'ecmascript@0.12.7',
    'caching-compiler@1.2.1',
    'babel-compiler@7.3.4',
  ],
  sources: [
    'plugin/regexps.js',
    'plugin/utils.js',
    'plugin/dev-server.js',
    'plugin/post-css.js',
    'plugin/tag-handler.js',
    'plugin/vue-compiler.js',
    'plugin/plugin.js',
  ],
  npmDependencies: {
    'postcss': '7.0.16',
    'postcss-load-config': '2.0.0',
    'postcss-selector-parser': '2.2.3',
    'postcss-modules': '1.4.1',
    'socket.io': '2.2.0',
    'async': '2.6.2',
    'lodash': '4.17.11',
    'hash-sum': '1.0.2',
    'source-map': '0.7.3',
    'source-map-merger': '0.2.0',
    'generate-source-map': '0.0.5',
    'autoprefixer': '9.5.1',
    'vue-template-compiler': '2.6.14',
    'vue-template-es2015-compiler': '1.9.1',
    'colors': '1.3.3',
    'app-module-path': '2.2.0',
  },
})

Package.onUse(function (api) {
  api.use('isobuild:compiler-plugin@1.0.0')
  api.use('akryum:vue-component-dev-server@0.1.4')
  api.use('akryum:vue-component-dev-client@0.4.7')
})
