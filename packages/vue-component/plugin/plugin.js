Plugin.registerCompiler({
  extensions: ['vue'],
  archMatching: 'web'
}, () => new VueComponentCompiler());


global.vue = global.vue || {}
global.vue.lang = global.vue.lang || {}
