Package.describe({
  name: 'akryum:vue-i18n',
  version: '0.0.1',
  summary: 'Internationalization for vue',
  git: 'https://github.com/Akryum/meteor-vue-component',
  documentation: 'README.md'
});

Package.registerBuildPlugin({
  name: "vue-i18n",
  use: [
    'ecmascript@0.4.4',
    'caching-compiler@1.0.5',
    'babel-compiler@6.8.0'
  ],
  sources: [
    'plugin/plugin.js'
  ],
  npmDependencies: {
    'lodash': '4.13.1'
  }
});

Package.onUse(function(api) {
  api.versionsFrom('1.3.3');
  api.use('isobuild:compiler-plugin@1.0.0');
  api.use('akryum:npm-check@0.0.2');
  api.use('ecmascript');
  api.use('webapp');
  api.use('akryum:vue@1.0.2');
  api.use('meteorhacks:inject-data@2.0.0');
  api.mainModule('client/client.js', 'client');
  api.mainModule('server/server.js', 'server');
});
