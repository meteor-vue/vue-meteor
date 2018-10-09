Package.describe({
  name: 'akryum:vue-stylus',
  version: '0.1.1',
  summary: 'Add stylus support for vue components',
  git: 'https://github.com/Akryum/meteor-vue-component',
  documentation: 'README.md',
})

Package.registerBuildPlugin({
  name: 'vue-component-stylus',
  use: [
    'ecmascript@0.11.1',
  ],
  sources: [
    'vue-stylus.js',
  ],
  npmDependencies: {
    stylus: 'https://github.com/meteor/stylus/tarball/bb47a357d132ca843718c63998eb37b90013a449', // fork of 0.54.5
    nib: '1.1.2',
  },
})

Package.onUse(function (api) {
  api.use('isobuild:compiler-plugin@1.0.0')
})
