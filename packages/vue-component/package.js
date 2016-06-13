Package.describe({
  name: 'akryum:vue-component',
  version: '0.3.0',
  summary: 'VueJS single-file components that hot-reloads',
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
    'plugin/file-hash.js',
    'plugin/dev-server.js',
    'plugin/throw-compile-error.js',
    'plugin/post-css.js',
    'plugin/tag-scanner.js',
    'plugin/tag-handler.js',
    'plugin/vue-compiler.js',
    'plugin/plugin.js'
  ],
  npmDependencies: {
    'postcss': '5.0.21',
    'postcss-selector-parser': '2.0.0',
    'socket.io': '1.4.6'
  }
});

Package.onUse(function(api) {
  api.use('isobuild:compiler-plugin@1.0.0');
  if(process.env.NODE_ENV === 'development') {
    api.use('ecmascript');
    api.use('akryum:vue@1.0.0');
    api.mainModule('client/dev-client.js', 'client');
    console.log('\nDev client (vue-components) added to bundle');
  }
});

Npm.depends({
  'socket.io-client': '1.4.6'
})
