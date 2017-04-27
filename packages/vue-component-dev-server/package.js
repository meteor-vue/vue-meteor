Package.describe({
  name: 'akryum:vue-component-dev-server',
  version: '0.0.7',
  summary: 'Dev server for vue hot-reloading',
  git: 'https://github.com/Akryum/meteor-vue-component',
  documentation: 'README.md',
  debugOnly: true
});

Package.onUse(function(api) {
  api.versionsFrom('1.3.3');
  api.use('ecmascript');
  api.use('webapp');
  api.mainModule('server/main.js', 'server');
});
