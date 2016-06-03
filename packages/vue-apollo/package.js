Package.describe({
  name: 'akryum:vue-apollo',
  version: '0.0.1',
  summary: 'support for apollo in vue components',
  git: 'https://github.com/Akryum/meteor-vue-component',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.3.2.4');
  api.use('ecmascript');
  api.use('accounts-base');
  api.use('akryum:vue');
  api.mainModule('vue-apollo.js', 'client');
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('akryum:vue-apollo');
  api.mainModule('vue-apollo-tests.js');
});

Npm.depends({
  'apollo-client': '0.3.12'
});
