Package.describe({
  name: 'akryum:vue-ssr',
  version: '0.0.1',
  summary: 'Render Vue server-side',
  git: 'https://github.com/Akryum/meteor-vue-component',
  documentation: 'README.md'
});


Package.registerBuildPlugin({
  name: "compileStaticHtmlBatch",
  use: [
    'ecmascript@0.6.3',
    'underscore@1.0.10',
    'caching-html-compiler@1.1.1',
    'templating-tools@1.1.1'
  ],
  sources: [
    'compile-html.js'
  ]
});

Package.onUse(function(api) {
  api.versionsFrom('1.4.3.1');
  api.use('akryum:npm-check@0.0.3');
  api.use('isobuild:compiler-plugin@1.0.0');
  api.use('ecmascript');
  api.mainModule('server/index.js', 'server');
  api.export('VueSSR', 'server');
});

Npm.depends({
  'vue-server-renderer': '2.2.4',
})
