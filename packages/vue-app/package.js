Package.describe({
  name: 'akryum:vue-app',
  version: '0.0.1',
  summary: 'Meteor app with vue',
  git: 'https://github.com/Akryum/meteor-vue-component',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.imply([
    'akryum:vue@1.0.3',
    'akryum:vue-component@0.5.2',
    'akryum:vue-router@0.1.2',
    'akryum:vuex@0.2.2',
    'akryum:vue-i18n@0.0.3'
  ]);
});
