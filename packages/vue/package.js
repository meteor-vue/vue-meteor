Package.describe({
  name: 'akryum:vue',
  version: '1.0.0',
  summary: 'Integrate Vue with Meteor',
  git: 'https://github.com/Akryum/meteor-vue-component',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.3.2.4');
  api.use('ecmascript');
  api.mainModule('index.js', 'client');
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('akryum:vue');
  api.mainModule('vue-tests.js', 'client');
});

Npm.depends({
  'vue': 'git+https://github.com/vuejs/vue#master'
})
