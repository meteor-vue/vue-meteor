import { VueApollo } from './client';

class DollarApollo {
  constructor(vm) {
    this.vm = vm;
    this.querySubscriptions = {};
  }

  get client() {
    return VueApollo.client;
  }

  get query() {
    return this.client.query;
  }

  watchQuery(options) {
    const vm = this.vm;
    const observable = client.watchQuery(options);

    return {
      observable,
      subscribe(options) {
        let sub = observable.subscribe(options);
        vm._apolloSubscriptions.push(sub);
        return sub;
      }
    }
  }

  get mutate() {
    return this.client.mutate;
  }

  option(key, options, watch) {
    const vm = this.vm;
    const $apollo = this;

    let query, sub;
    let forceFetch = options.forceFetch;
    let pollInterval = options.pollInterval;
    let returnPartialData = options.returnPartialData;
    let fragments = options.fragments;
    let loadingKey = options.loadingKey;
    let loadingChangeCb = options.watchLoading;

    if(typeof loadingChangeCb === 'function') {
      loadingChangeCb = loadingChangeCb.bind(vm);
    }

    let firstLoadingDone = false;

    if(options.query) {
      query = options.query;
    } else {
      query = options;
    }

    if(typeof options.variables === 'function') {
      vm.$watch(options.variables.bind(vm), q, {
        immediate: true
      });
    } else {
      q(options.variables);
    }

    function nextResult({data}) {
      applyData(data);
    }

    function sendingError(error) {
      error(error);
    }

    function applyData(data) {
      loadingDone();

      if(typeof options.update === 'function') {
        vm.$set(key, options.update.call(vm, data));
      } else if(data[key] === undefined){
        console.error(`Missing ${key} attribute on result`, data);
      } else {
        vm.$set(key, data[key]);
      }

      if(typeof options.result === 'function') {
        options.result.call(vm, data);
      }
    }

    function applyLoadingModifier(value) {
      if(loadingKey) {
        vm.$set(loadingKey, vm.$get(loadingKey) + value);
      }

      if(loadingChangeCb) {
        loadingChangeCb(value === 1, value);
      }
    }

    function loadingDone() {
      if(!firstLoadingDone) {
        applyLoadingModifier(-1);
        firstLoadingDone = true;
      }
    }

    function error(error) {
      loadingDone();

      if(error.graphQLErrors && error.graphQLErrors.length !== 0) {
        console.error(`GraphQL execution errors for query ${query}`);
        for(let e of error.graphQLErrors) {
          console.error(e);
        }
      } else if(error.networkError) {
        console.error(`Error sending the query ${query}`, error.networkError);
      } else {
        console.error(error);
      }

      if(typeof options.error === 'function') {
        options.error(error);
      }
    }

    function q(variables) {
      applyLoadingModifier(1);
      if(watch) {
        if (sub) {
          sub.unsubscribe();
        }
        $apollo.querySubscriptions[key] = sub = $apollo.watchQuery({
          query,
          variables,
          forceFetch,
          pollInterval,
          returnPartialData,
          fragments
        }).subscribe({
          next: nextResult,
          error: sendingError
        });
      } else {
        $apollo.query({
          query,
          variables,
          forceFetch,
          fragments
        }).then(nextResult).catch(sendingError);
      }
    }
  }
}

module.exports = {
  install(Vue) {

    const init = Vue.prototype._init;
    Vue.prototype._init = function(options) {
      options = options || {};

      this._apolloSubscriptions = [];

      this.$apollo = new DollarApollo(this);

      init.call(this, options);
    }

    const destroy = Vue.prototype._destroy
    Vue.prototype._destroy = function() {
      if (!this._isBeingDestroyed && this.$apollo) {
        this.$apollo = null;
      }
      destroy.apply(this, arguments);
    }

    Vue.mixin({

      beforeCompile: function() {
        let apollo = this.$options.apollo;

        if (apollo) {
          // One-time queries with $query(), called each time a Vue dependency is updated (using $watch)
          if (apollo.data) {
            for (let key in apollo.data) {
              this.$apollo.option(key, apollo.data[key], false);
            }
          }

          // Auto updating queries with $watchQuery(), re-called each time a Vue dependency is updated (using $watch)
          if (apollo.watch) {
            for (let key in apollo.watch) {
              this.$apollo.option(key, apollo.watch[key], true);
            }
          }
        }
      },

      destroyed: function() {
        this._apolloSubscriptions.forEach((sub) => {
          sub.unsubscribe();
        });
        this._apolloSubscriptions = null;
      }

    })

  }
}
