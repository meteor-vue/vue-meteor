Plugin.registerCompiler({
  extensions: ['vue'],
  archMatching: 'web',
  isTemplate: true
}, () => new VueComponentCompiler());
