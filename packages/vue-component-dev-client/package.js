Package.describe({
  name: 'akryum:vue-component-dev-client',
  version: '0.0.4',
  summary: 'Hot-reloading client for vue components',
  git: 'https://github.com/Akryum/meteor-vue-component',
  documentation: 'README.md',
  debugOnly: true
});

Package.onUse(function(api) {
  api.versionsFrom('1.3.3');
  api.use('ecmascript');
  api.use('akryum:vue@1.0.2');
  api.mainModule('client/dev-client.js', 'client');
  console.log('\nDev client (vue-components) added to bundle');
});


Npm.depends({
  'socket.io-client': '1.4.6'
});
