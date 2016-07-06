import {Vue} from 'meteor/akryum:vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

export class Router extends VueRouter {
  constructor(options) {
    super(options);

    Router.instance = this;
    Router._init(this);
  }
}

const _initCbs = [];

Router._init = function(instance) {
  _initCbs.forEach(cb => {
    cb(instance);
  });
};

Router.configure = function(cb) {
  if(Router.instance) {
    cb(Router.instance);
  } else {
    _initCbs.push(cb);
  }
}
