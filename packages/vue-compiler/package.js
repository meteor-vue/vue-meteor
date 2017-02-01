Package.describe({
  name: 'akryum:vue-compiler',
  version: '2.1.10',
  summary: 'VueJS template compilation toolkit',
  git: 'https://github.com/Akryum/meteor-vue-component',
  documentation: 'README.md'
})

Package.onUse(function(api) {
  api.versionsFrom('1.4.2');
  api.use('ecmascript');
  api.mainModule('index.js');
})

Npm.depends({
  'vue-template-compiler': '2.1.10',
  'vue-template-es2015-compiler': '1.5.0',
})
