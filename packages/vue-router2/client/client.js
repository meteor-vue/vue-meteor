import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

// scrollBehavior:
// - only available in html5 history mode
// - defaults to no scroll behavior
// - return false to prevent scroll
export const nativeScrollBehavior = (to, from, savedPosition) => {
  if (savedPosition) {
    // savedPosition is only available for popstate navigations.
    return savedPosition
  } else {
    const position = {}
    // new navigation.
    // scroll to anchor by returning the selector
    if (to.hash) {
      position.selector = to.hash
    }
    // check if any matched route config has meta that requires scrolling to top
    if (to.matched.some(m => m.meta.scrollToTop)) {
      // cords will be used if no selector is provided,
      // or if the selector didn't match any element.
      position.x = 0
      position.y = 0
    }
    // if the returned position is falsy or an empty object,
    // will retain current scroll position.
    return position
  }
}

export class RouterFactory {
  // Vue-router constructor options
  constructor (options) {
    this.options = options
    this.options.routes = options.routes || []
  }

  // The order of the routes matters
  addRoutes (array) {
    array.forEach(route => {
      this.addRoute(route)
    })
  }

  addRoute (route) {
    this.options.routes.push(route)
  }

  create () {
    // Callbacks
    const cbs = RouterFactory._cbs || []
    cbs.sort((a, b) => b.priority - a.priority).forEach(fn => fn(this))

    // Real vue-router instance
    this.router = new VueRouter(this.options)
    return this.router
  }

  // Callbacks with higher priority will be called before
  static configure (cb, priority) {
    if (!RouterFactory._cbs) {
      RouterFactory._cbs = []
    }
    cb.priority = priority || 0
    RouterFactory._cbs.push(cb)
  }
}
