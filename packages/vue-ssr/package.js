Package.describe({
  name: 'akryum:vue-ssr',
  version: '0.0.1',
  summary: 'Render Vue server-side',
  git: 'https://github.com/Akryum/meteor-vue-component',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.4.3.1');
  api.use('akryum:npm-check@0.0.2');
  api.use('ecmascript');
  api.mainModule('index.js', 'client');
});
