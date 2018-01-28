Package.describe({
  name: 'akryum:vue-router2',
  version: '0.2.0',
  summary: 'Easy vue routing for Meteor - vue-router 2.x',
  git: 'https://github.com/Akryum/meteor-vue-component',
  documentation: 'README.md',
})

Package.registerBuildPlugin({
  name: 'vue-router',
  use: [
    'ecmascript@0.10.0',
    'caching-compiler@1.1.11',
    'babel-compiler@7.0.0',
  ],
  sources: [
    'plugin/plugin.js',
  ],
})

Package.onUse(function (api) {
  api.use('isobuild:compiler-plugin@1.0.0')
  api.use('ecmascript@0.10.0')
  api.use('akryum:npm-check@0.1.0')
  api.mainModule('client/client.js', 'client')
  api.export(['Router', 'nativeScrollBehavior'], 'client')
})
