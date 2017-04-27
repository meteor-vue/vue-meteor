Package.describe({
  name: 'akryum:vue-jade',
  version: '0.0.2',
  summary: 'Add jade support for vue components',
  git: 'https://github.com/Akryum/meteor-vue-component',
  documentation: 'README.md'
});

Package.registerBuildPlugin({
  name: "vue-component-jade",
  use: [
    'ecmascript@0.4.3'
  ],
  sources: [
    'vue-jade.js'
  ],
  npmDependencies: {
    'jade': '1.11.0'
  }
});

Package.onUse(function(api) {
  api.use('isobuild:compiler-plugin@1.0.0');
});
