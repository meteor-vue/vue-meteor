# Vue-router 2.x integration for Meteor

## Add routes in the blink of an eye.
Routing for vue and meteor using [vue-router](https://github.com/vuejs/vue-router).

See the [example here](https://github.com/Akryum/meteor-vue2-example-routing).

## Installation


    meteor add akryum:vue-router2

## Usage

### Router options

First, let's create our router:

```javascript
/* /client/client.js */

// Import the router
import {Router, nativeScrollBehavior} from 'meteor/akryum:vue-router2';

// Create router instance
const router = new Router({
  mode: 'history',
  scrollBehavior: nativeScrollBehavior,
});
```

When you create the router instance, you can pass `options` that allow you to customize the router behavior ([more info](http://router.vuejs.org/en/api/options.html)).

### Route definition

In your client, add some routes with the `Router.configure()` method (for more info about route definition, check the [vue-router documentation](http://router.vuejs.org/en/essentials/nested-routes.html)):

```javascript
/* /client/routes.js */

// Import the router
import {Router} from 'meteor/akryum:vue-router2';

// Components
import Home from '/imports/ui/Home.vue';
import Forum from '/imports/ui/Forum.vue';
import Apollo from '/imports/ui/Apollo.vue';

Router.configure(router => {
  // Simple routes
  router.addRoutes([
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/forum',
      name: 'forum',
      component: Forum,
    },
    {
      path: '/apollo',
      name: 'apollo',
      component: Apollo,
    },
  ]);
});
```

**Attention! The order of the routes matters during the route matching!***

The callbacks you pass to the `Router.configure()` calls will be called before the router is started, regardless of the file load order.

You can pass a second integer argument `priority`, that changes the order in which the callbacks are called to add routes. Callbacks with higher priority will be called before the others. The default priority is `0`.

#### Simple syntax

You can use an alternative special syntax in `.routes.js` files:

```javascript
/* /client/main.routes.js */
export default [
  {
    path: '/',
    name: 'home',
    component: '/imports/ui/Home.vue'
  },
  {
    path: '/forum',
    name: 'forum',
    component: '/imports/ui/Forum.vue'
  },
  {
    path: '/apollo',
    name: 'apollo',
    component: '/imports/ui/Apollo.vue'
  }
];
```

All the routes will be automatically added and the component's paths resolved.

### App menu

Use the `router-link` component to add dynamic links that take to different routes in your app ([more info](http://router.vuejs.org/en/api/router-link.html)):

```html
<!-- /imports/ui/AppMenu.vue -->
<template>
<div class="app-menu">
  <router-link :to="{ name:'home', exact: true }">Home</router-link>
  <router-link :to="{ name:'forum' }">Forum</router-link>
  <router-link :to="{ name:'apollo' }">Apollo</router-link>
</div>
</template>

<style scoped lang="sass">
@import ~imports/ui/colors.sass

.app-menu
  margin: 32px 0
  text-align: center

  a
    display: inline-block
    padding: 6px
    margin: 0 6px
    border-radius: 3px
    &.v-link-active
      background: $app-color
      color: white
</style>
```

### App layout

Create a vue component with a `<router-view></router-view>` element, that will contain the route content ([more info](http://router.vuejs.org/en/api/router-view.html)):

```html
<!-- /imports/ui/AppLayout.vue -->
<template>
<div class="app-layout">
  <!-- Menu -->
  <app-menu></app-menu>

  <!-- Route content -->
  <router-view></router-view>
</div>
</template>

<script>
import AppMenu from '/imports/ui/AppMenu.vue';

export default {
  components: {
    AppMenu
  }
}
</script>
```

### Not found page

To add a 'not found' page, add a `*` route in your client code:

```javascript
/* /client/routes.js */

// Import the router
import {Router} from 'meteor/akryum:vue-router';

// Not found
import NotFound from '/imports/ui/NotFound.vue';

Router.configure(router => {
  router.addRoute({
    path: '*',
    component: NotFound,
  });
}, -1);
```

*Note that we use a priority of `-1`, so this route is added last. If we don't do that, there is a chance that this route will be first and then will match immediatly: the user will be greeted by a 'not found' page everytime he loads the app!*

### Starting the router

Then import the routes and start the router in your client:

```javascript
/* /client/client.js */

// App layout
import AppLayout from '/imports/ui/AppLayout.vue';

// App start
Meteor.startup(() => {
  // Start the router
  new Vue({
    router: router.start(),
    render: h => h(AppLayout),
  }).$mount('app');
});

```

**If you put your routes files in the `/imports` folder, you need to import them manually.**

To start the router, use the `router.start()` method and pass the result to a Vue instance with the `router` option.

### Fast-render

You can use the [meteorhacks:fast-render](https://github.com/kadirahq/fast-render) package to inject the subscriptions data in the html. This greatly speeds up the initial render of your app if it depends on subscriptions.

First, install the fast-render package:

    meteor add meteorhacks:fast-render

In your server, add fast-render routes:

```javascript
FastRender.route('/forum', function(params) {
  this.subscribe('threads');
});
```

This will send the `threads` subscription data along side the html if the user open your app with the `yourapp/forum` url.

---

## Next steps

- [Example project](https://github.com/Akryum/meteor-vue2-example-routing)
- [Integrate apollo](https://github.com/Akryum/vue-apollo)

---

LICENCE ISC - Created by Guillaume CHAU (@Akryum)
