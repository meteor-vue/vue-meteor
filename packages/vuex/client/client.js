import { Tracker } from 'meteor/tracker';
import { Vue } from 'meteor/akryum:vue';
import Vuex from 'vuex';
import _ from 'lodash';

import { getWatcher, getDep } from './util';

export class StoreSubModule {
  constructor(name) {
    this.name = name;
    this.getters = {};
    this.actions = {};
    this.trackers = {};

    this._state = {};
    this._getters = {};
    this._mutations = {};
    this._actions = {};
    this._trackers = {};
    this._meteorData = {};
    this._trackerHandlers = {};
    this._vm = null;
    this._exported = false;
  }

  addState(data) {
    this._checkExported();
    _.merge(this._state, data);
  }

  addGetters(map) {
    this._checkExported();
    _.merge(this._getters, map);
  }

  addMutations(map) {
    this._checkExported();
    _.merge(this._mutations, map);
  }

  addActions(map) {
    this._checkExported();
    _.merge(this._actions, map);
  }

  addTrackers(map) {
    this._checkExported();
    _.merge(this._trackers, map);
  }

  getState(state) {
    return state[this.name];
  }

  callMethod(...args) {
    return new Promise((resolve, reject) => {
      // Last arg can be a callback
      let cb;
      if(args.length !== 0) {
        let lastArg = args[args.length - 1];
        if(typeof lastArg === 'function') {
          cb = args.pop();
        }
      }

      // Method callback
      args.push((err, result) => {
        if(err) {
          reject(err);
          if(cb) {
            cb(err, null);
          }
        } else {
          resolve(result);
          if(cb) {
            cb(null, result);
          }
        }
      });

      // Call the meteor method
      Meteor.call.apply(null, args);
    });
  }

  _checkExported() {
    if(this._exported) {
      throw new Error(`The store has been exported, you can't change the modules anymore.`);
    }
  }

  _createTrackers() {
    for (let t in this._trackers) {
      let handler = new StoreTracker(t, this._trackers[t](), this);
      this.trackers[t] = this._trackerHandlers[t] = handler;
    }

    // Create the Vue instance that will hold meteor data
    this._vm = new Vue({
      data: this._meteorData
    });
  }

  _setStore(store) {
    this.store = store;
    for (let t in this._trackerHandlers) {
      this._trackerHandlers[t].setStore(store);
    }

    this._exported = true;
  }

  _processGetters() {
    for (let g in this._getters) {
      this.getters[g] = this._addGetter(this._getters[g]);
    }
  }

  _addGetter(getter) {
    return (state) => {
      return getter(this.getState(state));
    }
  }

  _processActions() {
    for (let g in this._actions) {
      this.actions[g] = this._addAction(this._actions[g]);
    }
  }

  _addAction(action) {
    return (store, ...args) => {
      if(!(store instanceof ExtendedStore)) {
        args.unshift(store);
        store = this.store;
      }

      return action.call(this, {
        store,
        state: this.getState(store.state)
      }, ...args);
    }
  }
}

export class StoreModule extends StoreSubModule {
  constructor() {
    super("root");
    this._modules = {};
    this.root = this;
  }

  getState(state) {
    return state;
  }

  addModule(module) {
    this._checkExported();
    this[module.name] = this._modules[module.name] = module;
    module.root = this;
  }

  exportStore() {

    this._processGetters();
    this._processActions();

    this._createTrackers();

    // Modules
    let modules = {};
    for (let m in this._modules) {
      let module = this._modules[m];
      modules[module.name] = {
        state: module._state,
        mutations: module._mutations
      }
    }

    let options = {
      state: this._state,
      mutations: this._mutations,
      modules
    };
    let store = new ExtendedStore(this, options);

    this._setStore(store);

    return store;
  }

  _createTrackers() {
    super._createTrackers();
    for (let m in this._modules) {
      this._modules[m]._createTrackers();
    }
  }

  _setStore(store) {
    super._setStore(store);
    for (let m in this._modules) {
      this._modules[m]._setStore(store);
    }
  }

  _processGetters() {
    super._processGetters();
    for (let m in this._modules) {
      this._modules[m]._processGetters();
    }
  }

  _processActions() {
    super._processActions();
    for (let m in this._modules) {
      this._modules[m]._processActions();
    }
  }
}

class ExtendedStore extends Vuex.Store {
  constructor(root, options) {
    super(options);
    this.root = root;
  }
}

class StoreTracker {
  constructor(id, options, module) {
    this.id = id;
    this.options = options;
    this.module = module;
    this.clientCount = 0;

    this._configure();
    this._activated = false;
  }

  setStore(store) {
    this.store = store;

    if (this.options.isActivated) {
      this.activate();
      this.clientCount++;
    }
  }

  activate() {
    if(!this._activated) {
      this._activated = true;

      if (this.options.activate) {
        this.options.activate();
      }

      if (this.watchCb && this.store) {
        this.store.watch((state) => {
          return this.watchCb(this.module.getState(state));
        }, this._autorun.bind(this), {
          immediate: true
        });
      } else {
        this._autorun();
      }

      if (Meteor.isDevelopment) {
        console.log(`Vuex tracker activated: ${this.module.name==='root'?'':this.module.name+'.'}${this.id}`);
      }
    }
  }

  deactivate() {
    if(this._activated) {
      this._activated = false;

      if (this.options.deactivate) {
        this.options.deactivate();
      }

      this._stopComputation();

      if (Meteor.isDevelopment) {
        console.log(`Vuex tracker deactivated: ${this.module.name==='root'?'':this.module.name+'.'}${this.id}`);
      }
    }
  }

  update(params) {
    this.updateCb(this.module._vm, params);
  }

  addClient() {
    this.clientCount++;

    if (this.clientCount === 1) {
      this.activate();
    }
  }

  removeClient() {
    this.clientCount--;

    if (this.clientCount === 0) {
      this.deactivate();
    }
  }

  _configure() {
    let func, init, watch;
    if (typeof this.options === 'function') {
      func = this.options;
    } else if (typeof this.options.update === 'function') {
      func = this.options.update;

      if (typeof this.options.init === 'function') {
        init = this.options.init;
      }

      if (typeof this.options.watch === 'function') {
        watch = this.options.watch;
      }
    } else {
      throw Error('You must provide either a function or an object with the mutate() method.');
    }

    this.updateCb = func;
    this.watchCb = watch;

    // Initialize meteor data
    if (init) {
      init(this.module._meteorData);
    }

    // Getters
    if(this.options.getters) {
      for(let k in this.options.getters) {
        if(k.indexOf('get') !== 0) {
          console.warn(`Getters in vuex trackers should be named like 'getName()', found '${k}' in module ${this.module.name}`);
        }
        let getter = this.options.getters[k];
        getter.tracker = this;
        this.module.trackers[k] = getter;
      }
    }
  }

  _stopComputation() {
    if (this.computation) {
      this.computation.stop();
    }
  }

  _autorun(params) {
    this._stopComputation();
    this.computation = Tracker.autorun(() => {
      this.update(params);
    })
  }
}

// Vue plugin

const PreVuexPlugin = {
  install(Vue) {
    // Init override
    const _init = Vue.prototype._init
    Vue.prototype._init = function(options = {}) {
      options.init = options.init ? [vuexInit].concat(options.init) : vuexInit;

      _init.call(this, options);
    }

    function vuexInit() {
      const options = this.$options;

      if(typeof options.vuex === 'function') {
        let vuexCb = options.vuex;
        let {store} = options;
        if (!store && options.parent && options.parent.$store) {
          store = options.parent.$store
        }
        options.vuex = vuexCb(store.root);
      }
    }
  }
}

const VuexPlugin = {
  install(Vue) {

    // Init override
    const _init = Vue.prototype._init
    Vue.prototype._init = function(options = {}) {
      options.init = options.init ? [vuexInit].concat(options.init) : vuexInit;

      _init.call(this, options);
    }

    function vuexInit() {
      const options = this.$options;

      const { vuex } = options;
      if (vuex) {
        this._vuex_trackers = [];
        const { trackers } = vuex;
        if (trackers) {
          for (let t in trackers) {
            defineVuexTracker(this, t, trackers[t]);
          }
        }
      }
    }

    function setter() {
      throw new Error('vuex getter properties are read-only.')
    }

    function defineVuexTracker(vm, key, getter) {
      const tracker = getter.tracker;
      Object.defineProperty(vm, key, {
        enumerable: true,
        configurable: true,
        get: makeComputedGetter(tracker, getter),
        set: setter
      });
      vm._vuex_trackers.push(tracker);
    }

    function makeComputedGetter(tracker, getter) {
      const {store} = tracker;
      const id = store._getterCacheId

      // cached
      if (getter[id]) {
        return getter[id]
      }
      const vm = tracker.module._vm
      const Watcher = getWatcher(vm)
      const Dep = getDep(vm)
      const watcher = new Watcher(
        vm,
        vm => getter(vm),
        null, { lazy: true }
      )
      const computedGetter = () => {
        if (watcher.dirty) {
          watcher.evaluate()
        }
        if (Dep.target) {
          watcher.depend()
        }
        return watcher.value
      }
      getter[id] = computedGetter
      return computedGetter
    }


    Vue.mixin({
      beforeCompile: function() {
        if(this._vuex_trackers) {
          for (let tracker of this._vuex_trackers) {
            tracker.addClient();
          }
        }
      },

      destroyed: function() {
        if(this._vuex_trackers) {
          for (let tracker of this._vuex_trackers) {
            tracker.removeClient();
          }
        }
      }
    })

    // option merging
    /*const merge = Vue.config.optionMergeStrategies.computed
    Vue.config.optionMergeStrategies.vuex = (toVal, fromVal) => {
      if (!toVal) return fromVal
      if (!fromVal) return toVal
      return {
        getters: merge(toVal.getters, fromVal.getters),
        state: merge(toVal.state, fromVal.state),
        actions: merge(toVal.actions, fromVal.actions),
        trackers: merge(toVal.trackers, fromVal.trackers)
      }
    }*/
  }
}

Vue.use(PreVuexPlugin);
Vue.use(Vuex);
Vue.use(VuexPlugin);
