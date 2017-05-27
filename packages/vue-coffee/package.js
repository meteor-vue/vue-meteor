Package.describe({
  name: 'akryum:vue-coffee',
  version: '0.0.5',
  summary: 'Add coffee support for vue components',
  git: 'https://github.com/Akryum/meteor-vue-component',
  documentation: 'README.md'
});

Package.registerBuildPlugin({
  name: "vue-component-coffee",
  use: [
    'ecmascript@0.4.4'
  ],
  sources: [
    'vue-coffee.js'
  ],
  npmDependencies: {
    'coffee-script': '1.12.6',
    'source-map': '0.5.6'
  }
});

Package.onUse(function(api) {
  api.use('isobuild:compiler-plugin@1.0.0');
});
