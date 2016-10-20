import _Vue from 'vue';
import _Plugin from 'vue-meteor-tracker';

_Vue.use(_Plugin);
export const Vue = _Vue;

if(Meteor.isDevelopment) {
  const vueVersion = parseInt(Vue.version.charAt(0));
  if(vueVersion === 1) {
    console.info(`You are using Vue 1.x; to upgrade to Vue 2.x, install it with 'meteor npm install --save vue@^2.0.3'.`);
  }
}
