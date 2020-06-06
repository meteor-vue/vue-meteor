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

  // Called when Vue app has finished rendering
  context.rendered = () => {
    // Inject some arbitrary JS
    context.js = `console.log('hello')`
  }

  return app
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
      
      // Called when Vue app has finished rendering
      context.rendered = () => {
        // Inject some arbitrary JS
        context.js = `console.log('hello')`
      }

      resolve(app)
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

    context.appendHtml = () => {
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

    resolve(app)
  })
}
```

### Request headers for the internationalization with meta tags

You can use `context.headers` for access to request headers from the server.
 
Example usage with `vue-i18n` and `vue-meta` packages:

`/imports/startup/server/vue-ssr.js`

```js
VueSSR.createApp = function (context) {
  return new Promise((resolve, reject) => {
    const { app, router, store } = createApp({
      ssr: true,
      headers: context.headers,
    })
  })
}
```

`/imports/startup/html-attr.js`

```js
import { WebApp } from 'meteor/webapp';
import { getHtmlLang } from '/imports/ui/i18n';

WebApp.addHtmlAttributeHook((req) => ({
  lang: getHtmlLang(req.headers),
  // @see https://vue-meta.nuxtjs.org/faq/prevent-initial.html
  'data-vue-meta-server-rendered': '',
}));
```

`/imports/ui/i18n.js`

```js
import Vue from 'vue';
import VueI18n from 'vue-i18n';

const messages = {
  en: {
    hello: 'Hello',  
  },
  ru: {
    hello: 'Здравствуйте',
  }
};

Vue.use(VueI18n);

const fallbackLocale = 'en'
const availableLocales = Object.keys(messages)

function getLanguage({ ssr, headers }) {
  return (
    !ssr
      ? (typeof navigator.languages !== 'undefined' // Client-side
        ? navigator.languages[0]
        : navigator.language // Fallback for old browsers
      ) : (headers && typeof headers['accept-language'] === 'string'  // Server-side
        ? headers['accept-language'].split(',')[0]
        : fallbackLocale
      )
  ).toLocaleLowerCase().substring(0, 2);
}

export function createI18n({ ssr, headers }) {
  return new VueI18n({
    locale: getLanguage({ ssr, headers }),
    fallbackLocale,
    messages,
  });
}

export function getHtmlLang(headers) {
  const locale = getLanguage({
    ssr: true,
    headers,
  });
  return availableLocales.includes(locale)
    ? locale
    : fallbackLocale
}
```

`/imports/ui/createApp.js`

```js
function createApp(context) {
  /*
    https://ssr.vuejs.org/guide/structure.html#avoid-stateful-singletons
   */
  const store = createStore()
  const router = createRouter()
  const i18n = createI18n(context)

  // sync the router with the vuex store.
  // this registers `store.state.route`
  sync(store, router);

  // Vuex state restoration
  if (!context.ssr && window.__INITIAL_STATE__) {
    // We initialize the store state with the data injected from the server
    store.replaceState(window.__INITIAL_STATE__)
  }

  const app = new Vue({
    el: '#app',
    router,
    store,
    i18n,
    ...App,
  })

  return {
    app,
    router,
    store,
  }
}
```

`/imports/ui/App.vue`

```vue
<template>
  <h1>{{ $t("title")}}</h1>
</template>

<script>
  export default {
    name: 'App',
    metaInfo() {
      return {
        title: this.$t('title'),
      }
    },
  }
</script>
```

---

LICENCE ISC - Created by Guillaume CHAU (@Akryum)
