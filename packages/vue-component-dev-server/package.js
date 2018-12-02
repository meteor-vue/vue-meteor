Package.describe({
  name: 'akryum:vue-component-dev-server',
  version: '0.1.3',
  summary: 'Dev server for vue hot-reloading',
  git: 'https://github.com/Akryum/meteor-vue-component',
  documentation: 'README.md',
  debugOnly: true,
})

Package.onUse(function (api) {
  api.use('ecmascript@0.12.1')
  api.use('webapp@1.7.0')
  api.mainModule('server/main.js', 'server')
})
