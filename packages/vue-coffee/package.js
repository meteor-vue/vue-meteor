Package.describe({
  name: 'akryum:vue-coffee',
  version: '0.4.1',
  summary: 'Add coffee support for vue components',
  git: 'https://github.com/Akryum/meteor-vue-component',
  documentation: 'README.md',
})

Package.registerBuildPlugin({
  name: 'vue-component-coffee',
  use: [
    'ecmascript@0.11.1',
    'coffeescript-compiler@2.3.1_2'
  ],
  sources: ['vue-coffee.js'],
})

Package.onUse(function (api) {
  api.use('isobuild:compiler-plugin@1.0.0')
})
