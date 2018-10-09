Package.describe({
  name: 'akryum:vue-sass',
  version: '0.1.1',
  summary: 'Add sass and scss support for vue components',
  git: 'https://github.com/Akryum/meteor-vue-component',
  documentation: 'README.md',
})

Package.registerBuildPlugin({
  name: 'vue-component-sass',
  use: [
    'ecmascript@0.11.1',
  ],
  sources: [
    'vue-sass.js',
  ],
  npmDependencies: {
    'node-sass': '4.9.3',
    'meteor-project-path': '0.0.3',
  },
})

Package.onUse(function (api) {
  api.use('isobuild:compiler-plugin@1.0.0')
})
