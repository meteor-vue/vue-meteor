Package.describe({
  name: 'akryum:npm-check',
  version: '0.0.1',
  summary: 'Check npm peer-dependencies and auto-installs them.',
  git: '',
  documentation: 'README.md'
});


Package.registerBuildPlugin({
  name: "npm-check",
  use: [
    'ecmascript@0.4.3',
  ],
  sources: [
    'check.js',
    'npm-check.js'
  ],
});


Package.onUse(function(api) {
  api.versionsFrom('1.3.2.4');
  api.use('isobuild:compiler-plugin@1.0.0');
});
