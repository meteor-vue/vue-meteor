import {Tracker} from 'meteor/tracker';
import {Vue} from 'meteor/akryum:vue';
import Vuex from 'vuex';
import _ from 'lodash';

Vue.use(Vuex);

let bus = new Vue({});

let trackerEventPrefix = '_vuex_tracker_';
function getAddClientEvent(id, moduleName) {
  return trackerEventPrefix + '_addClient__' + moduleName + '__' + id
}
function getRemoveClientEvent(id, moduleName) {
  return trackerEventPrefix + '_removeClient__' + moduleName + '__' + id
}

function parseTrackerPath(t) {
  let tPath = t.split('.');
  if(tPath.length < 1 || tPath.length > 2) {
    throw new Error(`The vuex.trackers options must contain only '<tracker_name>' or '<module_name>.<tracker_name>' strings.`);
  }
  let moduleName, id;
  if(tPath.length == 1) {
    moduleName = "root";
    id = tPath[0];
  } else {
    moduleName = tPath[0];
    id = tPath[1];
  }
  return {
    moduleName,
    id
  }
}

export class StoreModule {
  constructor(name) {
    this.name = name;
    this.getters = {};
    this.actions = {};

    this._state = {};
    this._getters = {};
    this._mutations = {};
    this._actions = {};
    this._trackers = {};
    this._trackerHandlers = {};
  }

  addState(data) {
    _.merge(this._state, data);
  }

  addGetters(map) {
    _.merge(this._getters, map);
  }

  addMutations(map) {
    _.merge(this._mutations, map);
  }

  addActions(map) {
    _.merge(this._actions, map);
  }

  addTrackers(map) {
    _.merge(this._trackers, map);
  }

  updateTracker(id) {
    let handler = this._trackerHandlers[id];
    if(handler) {
      handler.update();
    }
  }

  getState(state) {
    return state[this.name];
  }

  _createTrackers() {
    for(let t in this._trackers) {
      let handler = new StoreTracker(t, this._trackers[t](), this);
      this._trackerHandlers[t] = handler;
    }
  }

  _setStore(store) {
    this.store = store;
    for(let t in this._trackerHandlers) {
      this._trackerHandlers[t].setStore(store);
    }
  }

  _processGetters() {
    for(let g in this._getters) {
      this.getters[g] = this._addGetter(this._getters[g]);
    }
  }

  _addGetter(getter) {
    return (state) => {
      return getter(this.getState(state));
    }
  }

  _processActions() {
    for(let g in this._actions) {
      this.actions[g] = this._addAction(this._actions[g]);
    }
  }

  _addAction(action) {
    return (store, ...args) => {
      return action.call(this, store, this.getState(store.state), ...args);
    }
  }
}

export class Store extends StoreModule {
  constructor() {
    super("root");
    this._modules = {};
  }

  getState(state) {
    return state;
  }

  addModule(module) {
    this._modules[module.name] = module;
    module.root = this;
  }

  exportStore() {

    this._processGetters();
    this._processActions();

    this._createTrackers();

    // Modules
    let modules = {};
    for(let m in this._modules) {
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
    for(let m in this._modules) {
      this._modules[m]._createTrackers();
    }
  }

  _setStore(store) {
    super._setStore(store);
    for(let m in this._modules) {
      this._modules[m]._setStore(store);
    }
  }

  _processGetters() {
    super._processGetters();
    for(let m in this._modules) {
      this._modules[m]._processGetters();
    }
  }

  _processActions() {
    super._processActions();
    for(let m in this._modules) {
      this._modules[m]._processActions();
    }
  }
}

class ExtendedStore extends Vuex.Store {
  constructor(store, options) {
    super(options);
  }

  activateTracker(path) {
    let {moduleName, id} = parseTrackerPath(path);
    bus.$emit(getAddClientEvent(id, moduleName));
  }

  deactivateTracker(path) {
    let {moduleName, id} = parseTrackerPath(path);
    bus.$emit(getRemoveClientEvent(id, moduleName));
  }
}

class StoreTracker {
  constructor(id, options, module) {
    this.id = id;
    this.options = options;
    this.module = module;

    this.clientCount = 0;

    this._createMutation();

    bus.$on(getAddClientEvent(this.id, this.module.name), () => {
      this.addClient();
    });

    bus.$on(getRemoveClientEvent(this.id, this.module.name), () => {
      this.removeClient();
    });
  }

  setStore(store) {
    this.store = store;

    if(this.options.autoActivate) {
      this.activate();
      this.clientCount ++;
    }
  }

  activate() {
    if(this.options.activate) {
      this.options.activate();
    }

    this.computation = Tracker.autorun(() => {
      this.update();
    })

    if(Meteor.isDevelopment) {
      console.log(`Vuex tracker activated: ${this.module.name==='root'?'':this.module.name+'.'}${this.id}`);
    }
  }

  deactivate() {
    if(this.options.deactivate) {
      this.options.deactivate();
    }

    if(this.computation) {
      this.computation.stop();
    }

    if(Meteor.isDevelopment) {
      console.log(`Vuex tracker deactivated: ${this.module.name==='root'?'':this.module.name+'.'}${this.id}`);
    }
  }

  update() {
    if(this.store) {
      this.store.dispatch({
        type: this.mutationName,
        silent: true
      });
    }
  }

  addClient() {
    this.clientCount++;

    if(this.clientCount === 1) {
      this.activate();
    }
  }

  removeClient() {
    this.clientCount--;

    if(this.clientCount === 0) {
      this.deactivate();
    }
  }

  _createMutation() {
    let func;
    if(typeof this.options === 'function') {
      func = this.options
    } else if(typeof this.options.mutate === 'function') {
      func = this.options.mutate
    } else {
      throw Error('You must provide either a function or an object with the mutate() method.')
    }
    this.mutation = func;
    this.mutationName = this.module.name + '_' + this.id + '_tracker';

    // Add mutation
    this.module.addMutations({
      [this.mutationName]: this.mutation
    });
  }
}

const VuePlugin = {
  install(Vue) {
    const _init = Vue.prototype._init
    Vue.prototype._init = function (options = {}) {
      options.init = options.init
        ? [vuexInit].concat(options.init)
        : vuexInit
      _init.call(this, options)
    }

    function vuexInit() {
      const options = this.$options;

      this._vuex_trackers_add_events = [];
      this._vuex_trackers_remove_events = [];

      const {vuex} = options;
      if(vuex) {
        const {trackers} = vuex;
        if(trackers) {
          for(let t of trackers) {
            let {moduleName, id} = parseTrackerPath(t);
            this._vuex_trackers_add_events.push(getAddClientEvent(id, moduleName));
            this._vuex_trackers_remove_events.push(getRemoveClientEvent(id, moduleName));
          }
        }
      }
    }

    Vue.mixin({
      beforeCompile: function() {
        for(let event of this._vuex_trackers_add_events) {
          bus.$emit(event);
        }
      },

      destroyed: function() {
        for(let event of this._vuex_trackers_remove_events) {
          bus.$emit(event);
        }
      }
    })
  }
}

Vue.use(VuePlugin);
