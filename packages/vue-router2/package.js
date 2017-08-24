Package.describe({
  name: 'akryum:vue-router2',
  version: '0.1.1',
  summary: 'Easy vue routing for Meteor - vue-router 2.x',
  git: 'https://github.com/Akryum/meteor-vue-component',
  documentation: 'README.md',
})

Package.registerBuildPlugin({
  name: 'vue-router',
  use: [
    'ecmascript@0.4.4',
    'caching-compiler@1.0.5',
    'babel-compiler@6.8.0',
  ],
  sources: [
    'plugin/plugin.js',
  ],
})

Package.onUse(function (api) {
  api.versionsFrom('1.3.3')
  api.use('isobuild:compiler-plugin@1.0.0')
  api.use('ecmascript')
  api.use('akryum:npm-check@0.0.4')
  api.mainModule('client/client.js', 'client')
  api.export(['Router', 'nativeScrollBehavior'], 'client')
})
