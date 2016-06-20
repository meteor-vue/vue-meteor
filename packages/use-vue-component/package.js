Package.describe({
  name: 'use-vue-component',
  version: '0.0.1',
  summary: '',
  git: '',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.3.3.1');
  api.use('ecmascript');
  api.use(['akryum:vue@1.0.2', 'akryum:vue-component@0.3.7']);
  api.mainModule('client/main.js', 'client');
});
