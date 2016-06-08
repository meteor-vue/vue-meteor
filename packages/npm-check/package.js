Package.describe({
  name: 'akryum:npm-check',
  version: '0.0.2',
  summary: 'Check npm peer-dependencies and auto-installs them.',
  git: 'https://github.com/Akryum/meteor-vue-component/tree/master/packages/npm-check',
  documentation: 'README.md'
});


Package.registerBuildPlugin({
  name: "npm-check",
  use: [
    'ecmascript@0.4.3',
  ],
  sources: [
    'lib.js',
    'npm-check.js'
  ],
});


Package.onUse(function(api) {
  api.versionsFrom('1.3.2.4');
  api.use('isobuild:compiler-plugin@1.0.0');
});
