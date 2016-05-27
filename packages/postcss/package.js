Package.describe({
  name: 'akryum:postcss',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: '',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
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
