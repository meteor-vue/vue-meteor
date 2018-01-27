Package.describe({
  name: 'akryum:vue-coffee',
  version: '0.3.0',
  summary: 'Add coffee support for vue components',
  git: 'https://github.com/Akryum/meteor-vue-component',
  documentation: 'README.md',
})

Package.registerBuildPlugin({
  name: 'vue-component-coffee',
  use: ['ecmascript@0.10.0', 'coffeescript-compiler@2.0.3_1'],
  sources: ['vue-coffee.js'],
})

Package.onUse(function (api) {
  api.use('isobuild:compiler-plugin@1.0.0')
})
