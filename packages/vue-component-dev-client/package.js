Package.describe({
  name: 'akryum:vue-component-dev-client',
  version: '0.4.7',
  summary: 'Hot-reloading client for vue components',
  git: 'https://github.com/Akryum/meteor-vue-component',
  documentation: 'README.md',
  debugOnly: true,
})

Package.onUse(function (api) {
  api.use('ecmascript@0.12.7')
  api.use('reload@1.3.0')
  api.use('autoupdate@1.6.0')
  api.use('reactive-var@1.0.11')
  api.mainModule('client/dev-client.js', 'client')
})

Npm.depends({
  'socket.io-client': '2.2.0',
})
