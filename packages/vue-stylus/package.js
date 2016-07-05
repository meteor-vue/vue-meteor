Package.describe({
  name: 'akryum:vue-stylus',
  version: '0.0.1',
  summary: 'Add stylus support for vue components',
  git: 'https://github.com/Akryum/meteor-vue-component',
  documentation: 'README.md'
});

Package.registerBuildPlugin({
  name: "vue-component-stylus",
  use: [
    'ecmascript@0.4.3'
  ],
  sources: [
    'vue-stylus.js'
  ],
  npmDependencies: {
    stylus: "https://github.com/meteor/stylus/tarball/d4352c9cb4056faf238e6bd9f9f2172472b67c5b", // fork of 0.51.1
    nib: "1.1.0"
  }
});

Package.onUse(function(api) {
  api.use('isobuild:compiler-plugin@1.0.0');
});
