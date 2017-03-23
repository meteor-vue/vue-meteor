# Vue+Meteor SSR

> Add Server-Side Rendering in your Vue+Meteor application

## Installation:

```
meteor add akryum:vue-ssr
```

## Usage

**:warning: All your client-side code should be available on the server (which means they shouldn't be in a `client` folder), and the code and libraries should be able to run on the server.**

*:warning: vuex & apollo are not tested yet.*

Wrap your Vue root instance in a `createApp` function and export it, alongside with the router instance:

```javascript
import Vue from 'vue'

// Meteor Tracker integration
import VueMeteorTracker from 'vue-meteor-tracker'
Vue.use(VueMeteorTracker)

import App from './ui/App.vue'
import router from './router'

function createApp () {
  return {
    app: new Vue({
      el: '#app',
      router,
      ...App,
    }),
    router,
  }
}

export default createApp
```

In your client code, start the app as usual:

```javascript
import { Meteor } from 'meteor/meteor'
import CreateApp from './app'

Meteor.startup(() => {
  CreateApp()
})
```

In your server code, you need to set the `VueSSR.createApp` method with a function that returns the Vue instance:

```javascript
import { VueSSR } from 'meteor/akryum:vue-ssr'
import CreateApp from './app'

VueSSR.createApp = function ({ url }) {
  const { app, router } = CreateApp()
  // Set the url in the router
  router.push(url)
  return app
}
```

Returning a promise works too:

```javascript
VueSSR.createApp = function ({ url }) {
  return new Promise((resolve, reject) => {
    const { app, router } = CreateApp()
    // Set the URL in the router
    router.push(url)

    router.onReady(() => {
      const matchedComponents = router.getMatchedComponents()

      // no matched routes
      if (!matchedComponents.length) {
        reject({ code: 404 })
      }

      // Can use components prefetch here...

      resolve(app)
    })
  })
}
```

Add the `<!--vue-ssr-outlet-->` comment in you HTML where you want to render the Vue app. If you don't, the app will be rendered at the beginning of the page body.

You can change the replacing snippet by setting the `VUE_OUTLET` environment variable, or by setting the `VueSSR.outlet` property:

```javascript
VueSSR.outlet = '<!--my-app-here-->'
```

You can also customize the template of the rendered HTML with the `VueSSR.template` property:

```javascript
VueSSR.template = `
<div class="app-wrapper">
  <!--vue-ssr-outlet-->
</div>
`
```

*:warning: The CSS can flicker in developpement mode and load after the app is rendered. This is due to the HMR system having to append dynamic style tag in the page to get the fastest reloading possible. This is not the case in production mode (try running your app with `meteor --production`).*

[Example project](https://github.com/Akryum/vue-meteor-demo)

---

LICENCE ISC - Created by Guillaume CHAU (@Akryum)
