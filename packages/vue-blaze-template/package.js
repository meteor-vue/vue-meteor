Package.describe({
  name: 'akryum:vue-blaze-template',
  version: '0.1.1',
  summary: 'Render Blaze templates in vue components',
  git: 'https://github.com/Akryum/meteor-vue-component',
  documentation: 'README.md',
})

Package.onUse(function (api) {
  api.versionsFrom('1.6')
  api.use([
    'ecmascript',
    'templating@1.3.2',
    'blaze@2.3.3',
  ])
  api.mainModule('vue-render-blaze.js', 'client')
})
