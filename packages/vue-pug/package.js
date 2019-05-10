Package.describe({
  name: 'akryum:vue-pug',
  version: '0.1.2',
  summary: 'Add pug support for vue components',
  git: 'https://github.com/Akryum/meteor-vue-component',
  documentation: 'README.md',
})

Package.registerBuildPlugin({
  name: 'vue-component-pug',
  use: [
    'ecmascript@0.12.7',
  ],
  sources: [
    'vue-pug.js',
  ],
  npmDependencies: {
    'pug': '2.0.3',
  },
})

Package.onUse(function (api) {
  api.use('isobuild:compiler-plugin@1.0.0')
})
