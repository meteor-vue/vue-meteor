Package.describe({
  name: 'akryum:vue-router',
  version: '0.2.1',
  summary: 'Easy vue routing for Meteor',
  git: 'https://github.com/Akryum/meteor-vue-component',
  documentation: 'README.md'
});

Package.registerBuildPlugin({
  name: "vue-router",
  use: [
    'ecmascript@0.4.4',
    'caching-compiler@1.0.5',
    'babel-compiler@6.8.0'
  ],
  sources: [
    'plugin/plugin.js'
  ]
});

Package.onUse(function(api) {
  api.versionsFrom('1.3.3');
  api.use('isobuild:compiler-plugin@1.0.0');
  api.use('ecmascript');
  api.use('akryum:npm-check@0.0.2');
  api.use('akryum:vue@1.0.2');
  api.mainModule('client/client.js', 'client');
  api.export('Router', 'client');
});
