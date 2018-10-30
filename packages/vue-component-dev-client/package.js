Package.describe({
  name: 'akryum:vue-component-dev-client',
  version: '0.4.3',
  summary: 'Hot-reloading client for vue components',
  git: 'https://github.com/Akryum/meteor-vue-component',
  documentation: 'README.md',
  debugOnly: true,
})

Package.onUse(function (api) {
  api.use('ecmascript@0.12.1')
  api.use('reload@1.2.0')
  api.use('autoupdate@1.5.0')
  api.use('reactive-var@1.0.11')
  api.mainModule('client/dev-client.js', 'client')
})

Npm.depends({
  'socket.io-client': '2.1.1',
})
