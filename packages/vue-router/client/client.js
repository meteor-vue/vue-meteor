import {Vue} from 'meteor/akryum:vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

class RouterClass {
  constructor() {
    this._defs = [];
  }

  map(def) {
    this._defs.push(def);
  }

  on(path, options) {
    this._defs.push({
      [path]: options
    });
  }

  start(options, App, el, callback) {
    this.lib = new VueRouter(options);
    for(let def of this._defs) {
      this.lib.map(def);
    }
    this.lib.start(App, el, callback);
  }
}


export const Router = new RouterClass();

/*export function getData(id) {
  let fastData = window.__fast_data__;
  if(fastData) {
    return fastData[id];
  }
}*/
