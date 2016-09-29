import { Tracker } from 'meteor/tracker';
import Vue from 'vue';
import Vuex from 'vuex';
import _ from 'lodash';

import { getWatcher, getDep } from './util';

export class StoreSubModule {
  constructor(name) {
    this.name = name;
    this.getters = {};
    this.actions = {};
    this.resources = {};

    this._modules = {};
    this._state = {};
    this._getters = {};
    this._mutations = {};
    this._actions = {};
    this._resources = {};
    this._resourceHandlers = {};
    this._initData = {};
    this._vm = null;
    this._exported = false;

    this._onReady = [];
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

  addResources(map) {
    this._checkExported();
    _.merge(this._resources, map);
  }

  addTrackers(map) {
    this._checkExported();
    for (const res of map) {
      res.tracker = true;
    }
    _.merge(this._resources, map);
  }

  addModule(module) {
    this._checkExported();
    this[module.name] = this._modules[module.name] = module;
    module.$parent = this;
    module.$root = this.$root;
  }

  onReady(callback) {
    this._onReady.push(callback);
    if (this.store) {
      callback.bind(this)(this);
    }
  }

  getState(state) {
    return this.$parent.getState(state)[this.name];
  }

  callMethod(...args) {
    return new Promise((resolve, reject) => {
      // Last arg can be a callback
      let cb;
      if (args.length !== 0) {
        const lastArg = args[args.length - 1];
        if (typeof lastArg === 'function') {
          cb = args.pop();
        }
      }

      // Method callback
      args.push((err, result) => {
        if (err) {
          reject(err);
          if (cb) {
            cb(err, null);
          }
        } else {
          resolve(result);
          if (cb) {
            cb(null, result);
          }
        }
      });

      // Call the meteor method
      Meteor.call.apply(null, args);
    });
  }

  _generateExportOptions() {
    // Modules
    const modules = {};
    for (const m in this._modules) {
      const module = this._modules[m];
      modules[module.name] = module._generateExportOptions();
    }

    const options = {
      state: this._state,
      mutations: this._mutations,
      modules,
    };

    return options;
  }

  _checkExported() {
    if (this._exported) {
      throw new Error('The store has been exported, you can\'t change the modules anymore.');
    }
  }

  _createResources() {
    // Standard resources
    for (const t in this._resources) {
      let handler;
      const res = this._resources[t];
      const options = res();
      if (res.tracker || options.tracker || options.subscribe) {
        handler = new StoreTracker(t, options, this);
      } else {
        handler = new StoreResource(t, options, this);
      }
      this.resources[t] = this._resources[t] = handler;
    }

    // Create the Vue instance that will hold resource & meteor data
    this._vm = new Vue({
      data: this._initData,
    });

    for (const m in this._modules) {
      this._modules[m]._createResources();
    }
  }

  _setStore(store) {
    this.store = store;
    for (const t in this._resourceHandlers) {
      this._resourceHandlers[t].setStore(store);
    }

    this._exported = true;

    for (const m in this._modules) {
      this._modules[m]._setStore(store);
    }

    // Callbacks
    for (const cb of this._onReady) {
      cb.bind(this)(this);
    }
    this._onReady.length = 0;
  }

  _processGetters() {
    for (const g in this._getters) {
      this.getters[g] = this._addGetter(this._getters[g]);
    }

    for (const m in this._modules) {
      this._modules[m]._processGetters();
    }
  }

  _addGetter(getter) {
    return (state) => {
      return getter(this.getState(state));
    };
  }

  _processActions() {
    for (const g in this._actions) {
      this.actions[g] = this._addAction(this._actions[g]);
    }

    for (const m in this._modules) {
      this._modules[m]._processActions();
    }
  }

  _addAction(action) {
    return (store, ...args) => {
      if (!(store instanceof ExtendedStore)) {
        args.unshift(store);
        store = this.store;
      }

      return action.call(this, {
        store,
        state: this.getState(store.state),
      }, ...args);
    };
  }
}

export class StoreModule extends StoreSubModule {
  constructor() {
    super('root');
    this.$root = this;
  }

  getState(state) {
    return state;
  }

  exportStore() {
    // Process options
    this._processGetters();
    this._processActions();
    this._createResources();

    // Create native vuex store
    const store = new ExtendedStore(this, this._generateExportOptions());
    this._setStore(store);

    return store;
  }
}

class ExtendedStore extends Vuex.Store {
  constructor($root, options) {
    super(options);
    this.$root = $root;
  }
}

class StoreResource {
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
    if (!this._activated) {
      this._activate();
    }
  }

  deactivate() {
    if (this._activated) {
      this._deactivate();
    }
  }

  update(params) {
    this.updateCb(this.module._vm, params);
  }

  addClient(vm) {
    this.clientCount++;

    if (this.grabCb) {
      this.grabCb(vm);
    }

    if (this.clientCount === 1) {
      this.activate();
    }
  }

  removeClient(vm) {
    this.clientCount--;

    if (this.releaseCb) {
      this.releaseCb(vm);
    }

    if (this.clientCount === 0) {
      this.deactivate();
    }
  }

  _activate() {
    this._activated = true;

    if (this.activateCb) {
      this.activateCb();
    }

    if (this.watchCb && this.store) {
      this.storeUnwatch = this.store.watch((state) => this.watchCb(this.module.getState(state)), this._applyUpdate.bind(this), {
        immediate: true,
      });
    } else {
      this._applyUpdate();
    }
  }

  _deactivate() {
    this._activated = false;

    if (this.deactivateCb) {
      this.deactivateCb();
    }

    if (this.storeUnwatch) {
      this.storeUnwatch();
      this.storeUnwatch = null;
    }
  }

  _applyUpdate(params) {
    this.update(params);
  }

  _configure() {
    let update, init, watch, activate, deactivate, grab, release;
    if (typeof this.options === 'function') {
      update = this.options;
    } else if (typeof this.options.update === 'function') {
      update = this.options.update;

      if (typeof this.options.init === 'function') {
        init = this.options.init;
      }

      if (typeof this.options.watch === 'function') {
        watch = this.options.watch;
      }

      if (typeof this.options.activate === 'function') {
        activate = this.options.activate;
      }

      if (typeof this.options.deactivate === 'function') {
        deactivate = this.options.deactivate;
      }

      if (typeof this.options.grab === 'function') {
        grab = this.options.grab;
      }

      if (typeof this.options.release === 'function') {
        release = this.options.release;
      }
    } else {
      throw Error('You must provide either a function or an object with the update() method.');
    }

    this.updateCb = update;
    this.watchCb = watch;
    this.activateCb = activate;
    this.deactivateCb = deactivate;
    this.grabCb = grab;
    this.releaseCb = release;

    // Initialize meteor data
    if (init) {
      init(this.module._initData);
    }

    // Getters
    if (this.options.getters) {
      for (const k in this.options.getters) {
        if (k.indexOf('get') !== 0) {
          console.warn(`Getters in vuex resources should be named like 'getName()', found '${k}' in module ${this.module.name}`);
        }
        const getter = this.options.getters[k];
        getter.resource = this;
        this.module.resources[k] = getter;
      }
    }
  }
}

class StoreTracker extends StoreResource {
  _configure() {
    super._configure();

    this._trackerHandles = [];
  }

  _activate() {
    super._activate();

    // Subscriptions
    if (this.options.subscribe) {
      for (let key in this.options.subscribe) {
        ((key, options) => {
          let sub;

          let subscribe = (params) => {
            if (sub) {
              this._stopHandle(sub);
            }
            sub = this._subscribe(key, ...params);
          }

          if (typeof options === 'function') {
            // Reactive subscribe
            this.store.watch(state => options(this.module.getState(state)), (params) => {
              subscribe(params);
            }, {
              immediate: true,
            });
          } else {
            subscribe(options);
          }
        })(key, this.options.subscribe[key]);
      }
    }
  }

  _deactivate() {
    super._deactivate();

    this._stopComputation();
    this._stopAllHandles();
  }

  _stopComputation() {
    if (this.computation) {
      this.computation.stop();
    }
  }

  _subscribe(...args) {
    let handle = Vue.config.meteor.subscribe.apply(this, args);
    this._trackerHandles.push(handle);
    return handle;
  }

  _stopHandle(handle) {
    handle.stop();
    let index = this._trackerHandles.indexOf(handle);
    if (index !== -1) {
      this._trackerHandles.splice(index, 1);
    }
  }

  _stopAllHandles() {
    this._trackerHandles.forEach(handle => {
      handle.stop();
    });
    this._trackerHandles.length = 0;
  }

  _applyUpdate(params) {
    this._stopComputation();
    this.computation = Tracker.autorun(() => {
      this.update(params);
    });
  }
}

/* export function generateGetters(options) {
  const result = {};
  options.forEach(option => {
    let key, path;
    if(typeof option === 'string') {
      key = option;
      path = key;
    } else if(typeof option.key === 'string') {
      key = option.key;
      path = option.path;
    } else {
      key = option[0];
      path = option[1];
    }
    result[key] = eval(`function getter(state){return state.${path};} getter;`);
  });
  return result;
} */

// Vue plugin

const PreVuexPlugin = {
  install(Vue) {
    // Init override
    const _init = Vue.prototype._init;
    Vue.prototype._init = function (options = {}) {
      options.init = options.init ? [vuexInit].concat(options.init) : vuexInit;

      _init.call(this, options);
    };

    function vuexInit() {
      const options = this.$options;

      if (typeof options.vuex === 'function') {
        const vuexCb = options.vuex;
        let { store } = options;
        if (!store && options.parent && options.parent.$store) {
          store = options.parent.$store;
        }

        if (!store) {
          console.error('No store is attached to the component. Did you add it on the component or one of its parent?');
        }

        options.vuex = vuexCb(store.$root);
      }
    }
  },
};

const VuexPlugin = {
  install(Vue) {
    // Init override
    const _init = Vue.prototype._init;
    Vue.prototype._init = function (options = {}) {
      options.init = options.init ? [vuexInit].concat(options.init) : vuexInit;

      _init.call(this, options);
    };

    function vuexInit() {
      const options = this.$options;

      const { vuex } = options;
      if (vuex) {
        this._vuexResources = [];
        const { resources } = vuex;
        if (resources) {
          for (const t in resources) {
            defineVuexResource(this, t, resources[t]);
          }
        }
      }
    }

    function setter() {
      throw new Error('vuex getter properties are read-only.');
    }

    function defineVuexResource(vm, key, getter) {
      const resource = getter.resource;
      Object.defineProperty(vm, key, {
        enumerable: true,
        configurable: true,
        get: makeComputedGetter(resource, getter),
        set: setter,
      });
      vm._vuexResources.push(resource);
    }

    function makeComputedGetter(resource, getter) {
      const { store } = resource;
      const id = store._getterCacheId;

      // cached
      if (getter[id]) {
        return getter[id];
      }
      const vm = resource.module._vm;
      const Watcher = getWatcher(vm);
      const Dep = getDep(vm);
      const watcher = new Watcher(
        vm,
        vm => getter(vm),
        null, { lazy: true }
      );
      const computedGetter = () => {
        if (watcher.dirty) {
          watcher.evaluate();
        }
        if (Dep.target) {
          watcher.depend();
        }
        return watcher.value;
      };
      getter[id] = computedGetter;
      return computedGetter;
    }


    Vue.mixin({
      beforeCompile() {
        if (this._vuexResources) {
          for (const resource of this._vuexResources) {
            resource.addClient(this);
          }
        }
      },

      destroyed() {
        if (this._vuexResources) {
          for (const resource of this._vuexResources) {
            resource.removeClient(this);
          }
        }
      },
    });

    // option merging
    /* const merge = Vue.config.optionMergeStrategies.computed
    Vue.config.optionMergeStrategies.vuex = (toVal, fromVal) => {
      if (!toVal) return fromVal
      if (!fromVal) return toVal
      return {
        getters: merge(toVal.getters, fromVal.getters),
        state: merge(toVal.state, fromVal.state),
        actions: merge(toVal.actions, fromVal.actions),
        resources: merge(toVal.resources, fromVal.resources)
      }
    }*/
  },
};

Vue.use(PreVuexPlugin);
Vue.use(Vuex);
Vue.use(VuexPlugin);
