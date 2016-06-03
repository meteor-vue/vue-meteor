import { client } from './client';


module.exports = {
  install(Vue) {

    const init = Vue.prototype._init
    Vue.prototype._init = function(options) {
      var vm = this;
      options = options || {}
      this._apolloSubscriptions = []
      this.$apollo = {
        client,

        query: client.query,

        querySubscriptions: {},
        watchQuery(options) {
          let observable = client.watchQuery(options)

          return {
            observable,
            subscribe(options) {
              let sub = observable.subscribe(options)
              vm._apolloSubscriptions.push(sub)
              return sub
            },
            unsubscribe: observable.unsubscribe
          }
        },

        mutate: client.mutate,

        option(key, options, watch) {
          let query, sub;
          let forceFetch = options.forceFetch;
          let pollInterval = options.pollInterval;
          let returnPartialData = options.returnPartialData;

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

          function nextResult({errors, data}) {
            if (errors) {
              error(errors, 'execution');
            } else  {
              applyData(data);
            }
          }

          function sendingError(error) {
            error([error], 'sending');
          }

          function applyData(data) {
            if(typeof options.update === 'function') {
              vm.$set(key, options.update.call(vm, data));
            } else if(data[key] === undefined){
              console.error(`Missing ${key} attribute on result`, data);
            } else {
              vm.$set(key, data[key])
            }

            if(typeof options.result === 'function') {
              options.result.call(vm, data);
            }
          }

          function error(errors, type) {
            if(type === 'execution') {
              console.error(`GraphQL execution errors for query ${query}`, errors)
            } else if(type === 'sending') {
              console.error(`Error sending the query ${query}`, error)
            }

            if(typeof options.error === 'function') {
              options.error(errors, type)
            }
          }

          function q(variables) {
            if(watch) {
              if (sub) {
                sub.unsubscribe()
              }
              vm.$apollo.querySubscriptions[key] = sub = vm.$apollo.watchQuery({
                query,
                variables,
                forceFetch,
                pollInterval,
                returnPartialData
              }).subscribe({
                next: nextResult,
                error: sendingError
              })
            } else {
              vm.$apollo.query({
                query,
                variables,
                forceFetch
              }).then(nextResult).catch(sendingError)
            }
          }
        }
      }

      init.call(this, options)
    }

    const destroy = Vue.prototype._destroy
    Vue.prototype._destroy = function() {
      if (!this._isBeingDestroyed && this.$apollo) {
        this.$apollo = null
      }
      destroy.apply(this, arguments)
    }

    Vue.mixin({

      beforeCompile: function() {
        let apollo = this.$options.apollo

        if (apollo) {
          // One-time queries with $query(), called each time a Vue dependency is updated (using $watch)
          if (apollo.data) {
            for (let key in apollo.data) {
              this.$apollo.option(key, apollo.data[key], false)
            }
          }

          // Auto updating queries with $watchQuery(), re-called each time a Vue dependency is updated (using $watch)
          if (apollo.watch) {
            for (let key in apollo.watch) {
              this.$apollo.option(key, apollo.watch[key], true)
            }
          }
        }
      },

      destroyed: function() {
        this._apolloSubscriptions.forEach((sub) => {
          sub.unsubscribe()
        })
        this._apolloSubscriptions = null
      }

    })

  }
}
