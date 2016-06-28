Package.describe({
  name: 'akryum:vue-i18n-ui',
  version: '0.0.3',
  summary: 'Premade components for akryum:vue-i18n',
  git: 'https://github.com/Akryum/meteor-vue-component',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.3.4');
  api.use('ecmascript');
  api.use([
    'akryum:vue@1.0.2',
    'akryum:vue-component@0.3.8',
    'akryum:vue-less@0.0.3',
    'akryum:vue-i18n@0.0.2'
  ]);
  api.addFiles([
    'lib.en.i18n.json',
    'lib.fr.i18n.json'
  ]);
  api.mainModule('client/client.js', 'client');
});
