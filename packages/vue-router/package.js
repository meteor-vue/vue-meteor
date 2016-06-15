Package.describe({
  name: 'akryum:vue-router',
  version: '0.0.1',
  summary: 'Vue-router for Meteor',
  git: 'https://github.com/Akryum/meteor-vue-component',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.3.3');
  api.use('ecmascript');
  api.use('akryum:npm-check@0.0.2');
  api.use('akryum:vue@1.0.2');
  api.use('webapp', 'server');
  api.mainModule('server/server.js', 'server');
  api.mainModule('client/client.js', 'client');
});
