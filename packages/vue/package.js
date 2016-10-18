Package.describe({
  name: 'akryum:vue',
  version: '1.2.0',
  summary: 'Integrate Vue with Meteor',
  git: 'https://github.com/Akryum/meteor-vue-component',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.3.2.4');
  api.use('akryum:npm-check@0.0.2');
  api.use('ecmascript');
  api.mainModule('index.js', 'client');
  api.export('Vue', 'client');
});

Npm.depends({
  'lodash.omit': '4.5.0',
});
