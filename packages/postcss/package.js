Package.describe({
  name: 'akryum:postcss',
  version: '0.0.1',
  summary: 'Postcss for meteor',
  git: 'https://github.com/Akryum/meteor-vue-component',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.3.2.4');
  api.use('ecmascript');
  api.mainModule('postcss.js');
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('akryum:postcss');
  api.mainModule('postcss-tests.js');
});

Npm.depends({
  'postcss': '5.0.21',
  'postcss-selector-parser': '2.0.0',
  'autoprefixer': '6.3.6'
})
