Package.describe({
  name: 'akryum:vue-sass',
  version: '0.0.5',
  summary: 'Add sass and scss support for vue components',
  git: 'https://github.com/Akryum/meteor-vue-component',
  documentation: 'README.md'
});

Package.registerBuildPlugin({
  name: "vue-component-sass",
  use: [
    'ecmascript@0.5.8'
  ],
  sources: [
      'vue-sass.js'
  ],
  npmDependencies: {
    'node-sass': '3.7.0',
    'meteor-project-path': '0.0.1'
  }
});

Package.onUse(function(api) {
  api.versionsFrom('1.4.1');
  api.use('isobuild:compiler-plugin@1.0.0');
});
