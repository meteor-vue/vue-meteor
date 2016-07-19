Package.describe({
  name: 'akryum:vue-apollo',
  version: '0.0.8',
  summary: 'Support for apollo client in vue components',
  git: 'https://github.com/Akryum/meteor-vue-component',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.3.2.4');
  api.use('akryum:npm-check@0.0.2');
  api.use('ecmascript');
  api.use('accounts-base');
  api.use('apollo@0.0.3');
  api.use('akryum:vue@1.0.0');
  api.mainModule('client/main.js', 'client');
  api.export('VueApollo', 'client');
});

Npm.depends({
  'lodash': '4.13.1'
});
