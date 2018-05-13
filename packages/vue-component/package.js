Package.describe({
  name: 'akryum:vue-component',
  version: '0.14.0',
  summary: 'VueJS single-file components that hot-reloads',
  git: 'https://github.com/Akryum/meteor-vue-component',
  documentation: 'README.md',
})

Package.registerBuildPlugin({
  name: 'vue-component',
  use: [
    'ecmascript@0.10.0',
    'caching-compiler@1.1.11',
    'babel-compiler@7.0.0',
    'templating-tools@1.1.2',
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
    'postcss': '6.0.16',
    'postcss-load-config': '1.2.0',
    'postcss-selector-parser': '2.2.3',
    'postcss-modules': '1.1.0',
    'socket.io': '2.0.4',
    'async': '2.6.0',
    'lodash': '4.17.4',
    'hash-sum': '1.0.2',
    'source-map': '0.7.0',
    'source-map-merger': '0.2.0',
    'generate-source-map': '0.0.5',
    'autoprefixer': '7.2.5',
    'vue-template-compiler': '2.5.13',
    'vue-template-es2015-compiler': '1.6.0',
    'colors': '1.1.2',
    'app-module-path': '2.2.0',
  },
})

Package.onUse(function (api) {
  api.use('isobuild:compiler-plugin@1.0.0')
  api.use('akryum:vue-component-dev-server@0.1.1')
  api.use('akryum:vue-component-dev-client@0.4.2')
})
