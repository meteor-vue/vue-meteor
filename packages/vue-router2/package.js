Package.describe({
  name: 'akryum:vue-router2',
  version: '0.2.3',
  summary: 'Easy vue routing for Meteor - vue-router 2.x',
  git: 'https://github.com/Akryum/meteor-vue-component',
  documentation: 'README.md',
})

Package.registerBuildPlugin({
  name: 'vue-router',
  use: [
    'ecmascript@0.12.7',
    'caching-compiler@1.2.1',
    'babel-compiler@7.3.4',
  ],
  sources: [
    'plugin/plugin.js',
  ],
})

Package.onUse(function (api) {
  api.use('isobuild:compiler-plugin@1.0.0')
  api.use('ecmascript@0.12.7')
  api.use('akryum:npm-check@0.1.1')
  api.mainModule('client/client.js', 'client')
  api.export(['RouterFactory', 'nativeScrollBehavior'], 'client')
})
