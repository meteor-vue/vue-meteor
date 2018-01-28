Package.describe({
  name: 'akryum:vue-component-dev-server',
  version: '0.1.0',
  summary: 'Dev server for vue hot-reloading',
  git: 'https://github.com/Akryum/meteor-vue-component',
  documentation: 'README.md',
  debugOnly: true,
})

Package.onUse(function (api) {
  api.use('ecmascript')
  api.use('webapp')
  api.mainModule('server/main.js', 'server')
})
