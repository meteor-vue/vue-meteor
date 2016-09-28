import { Meteor } from 'meteor/meteor'
import { Tracker } from 'meteor/tracker'

function defaultSubscription(...args) {
  return Meteor.subscribe(...args)
}

export default {
  install(Vue) {

    Vue.config.meteor = {
      subscribe: defaultSubscription
    }

    /*const init = Vue.prototype._init
    Vue.prototype._init = function(options) {
      this._trackerHandles = []
      init.call(this, options)
    }*/

    function prepare() {
      this._trackerHandles = [];
    }

    function launch() {
      let meteor = this.$options.meteor
      if (meteor) {

        // Reactive data
        if (meteor.data) {
          for (let key in meteor.data) {
            ((key, options) => {
              let func, vueParams
              if (typeof options === 'function') {
                func = options.bind(this)
              } else if (typeof options.update === 'function') {
                func = options.update.bind(this)
                if (typeof options.params === 'function') {
                  vueParams = options.params.bind(this)
                }
              } else {
                throw Error('You must provide either a function or an object with the update() method.')
              }

              let computation

              let autorun = (params) => {
                computation = this.$autorun(() => {
                  let result = func(params)
                  if (result && typeof result.fetch === 'function') {
                    result = result.fetch()
                  }
                  this[key] = result;
                })
              }

              if (vueParams) {
                this.$watch(vueParams, (params) => {
                  if (computation) {
                    this.$stopHandle(computation)
                  }
                  autorun(params)
                }, {
                  immediate: true
                })
              } else {
                autorun()
              }
            })(key, meteor.data[key])
          }
        }

        // Subscriptions
        if (meteor.subscribe) {
          for (let key in meteor.subscribe) {
            ((key, options) => {
              let sub

              let subscribe = (params) => {
                if (sub) {
                  this.$stopHandle(sub)
                }
                sub = this.$subscribe(key, ...params)
              }

              if (typeof options === 'function') {
                this.$watch(options, (params) => {
                  subscribe(params)
                }, {
                  immediate: true
                })
              } else {
                subscribe(options)
              }
            })(key, meteor.subscribe[key])
          }
        }
      }
    }

    Vue.mixin({

      // Vue 1.x
      init: prepare,
      // Vue 2.x
      beforeCreate: prepare,

      created: launch,

      destroyed: function() {
        //Stop all reactivity when view is destroyed.
        this._trackerHandles.forEach((tracker) => {
          try {
            tracker.stop()
          } catch (e) {
            console.error(e, tracker)
          }
        })
        this._trackerHandles = null
      },


      methods: {
        $subscribe(...args) {
          let handle = Vue.config.meteor.subscribe.apply(this, args)
          this._trackerHandles.push(handle)
          return handle
        },

        $autorun(reactiveFunction) {
          let handle = Tracker.autorun(reactiveFunction)
          this._trackerHandles.push(handle)
          return handle
        },

        $stopHandle(handle) {
          handle.stop()
          let index = this._trackerHandles.indexOf(handle)
          if (index !== -1) {
            this._trackerHandles.splice(index, 1)
          }
        }

      }

    })

  }
}
