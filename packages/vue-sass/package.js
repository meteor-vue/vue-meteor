Package.describe({
  name: 'akryum:vue-sass',
  version: '0.1.0',
  summary: 'Add sass and scss support for vue components',
  git: 'https://github.com/Akryum/meteor-vue-component',
  documentation: 'README.md',
})

Package.registerBuildPlugin({
  name: 'vue-component-sass',
  use: [
    'ecmascript@0.10.0',
  ],
  sources: [
    'vue-sass.js',
  ],
  npmDependencies: {
    'node-sass': '4.5.3',
    'meteor-project-path': '0.0.1',
  },
})

Package.onUse(function (api) {
  api.versionsFrom('1.6')
  api.use('isobuild:compiler-plugin@1.0.0')
})
