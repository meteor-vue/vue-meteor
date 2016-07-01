Package.describe({
  name: 'akryum:vuex',
  version: '0.1.1',
  summary: 'State management with vuex for Meteor',
  git: 'https://github.com/Akryum/meteor-vue-component',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.3.3');
  api.use('ecmascript');
  api.use('akryum:npm-check@0.0.2');
  api.use('akryum:vue@1.0.3');
  api.mainModule('client/client.js', 'client');
  api.export(['StoreModule', 'StoreSubModule'], 'client');
});

Npm.depends({
  'lodash': '4.13.1'
});
