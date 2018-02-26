# Vue+Meteor SSR

> Add Server-Side Rendering in your Vue+Meteor application

## Installation:

```
meteor add akryum:vue-ssr
```

## Usage

**:warning: All your client-side code should be available on the server (which means they shouldn't be in a `client` folder), and the code and libraries should be able to run on the server.**

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

VueSSR.createApp = function (context) {
  const { app, router } = CreateApp()
  // Set the url in the router
  router.push(context.url)
  return {
    app,
    // Inject some arbitrary JS
    js: `console.log('hello')`,
  }
}
```

Returning a promise works too:

```javascript
VueSSR.createApp = function (context) {
  return new Promise((resolve, reject) => {
    const { app, router } = CreateApp()
    // Set the URL in the router
    router.push(context.url)

    router.onReady(() => {
      const matchedComponents = router.getMatchedComponents()

      // no matched routes
      if (!matchedComponents.length) {
        reject({ code: 404 })
      }

      // Can use components prefetch here...

      resolve({
        app,
        // Inject some arbitrary JS
        js: `console.log('hello')`,
      })
    })
  })
}
```

Add the `<div id="app"></div>` element in you HTML where you want to render the Vue app. If you don't, the app will be rendered at the beginning of the page body.

You can change the id of the element by setting the `VUE_OUTLET` environment variable, or by setting the `VueSSR.outlet` property:

```javascript
VueSSR.outlet = 'my-app'
```

In this example, Vue SSR expects a `<div id="my-app">` element in the HTML page.

*:warning: The CSS can flicker in developpement mode and load after the app is rendered. This is due to the HMR system having to append dynamic style tags in the page to get the fastest reloading possible. This is not the case in production mode (try running your app with `meteor --production`).*

[Example project](https://github.com/Akryum/vue-meteor-demo)

### Head and Body injection

You can modify the head and body of the SSR render with the `appendHtml` function. This example uses vue-meta:

```javascript
VueSSR.createApp = function (context) {
  return new Promise((resolve, reject) => {
    const { app, router, store } = createApp()

    router.push(context.url)
    context.meta = app.$meta()

    // ...

    resolve({
      app,
      appendHtml() {
        const {
          title, link, style, script, noscript, meta
        } = context.meta.inject()

        return {
          head: `
            ${meta.text()}
            ${title.text()}
            ${link.text()}
            ${style.text()}
            ${script.text()}
            ${noscript.text()}
          `,
          body: script.text({ body: true })
        }
      }
    })
  })
}
```

---

LICENCE ISC - Created by Guillaume CHAU (@Akryum)
