# Vue-router integration for Meteor

## Add routes in the blink of an eye.
Routing for vue and meteor using [vue-router](https://github.com/vuejs/vue-router).

See the [example here](https://github.com/Akryum/meteor-vue-example-routing).

## Installation


    meteor add akryum:vue-router

## Usage

### Route definition

In your client, add some routes (for more info about route definition, check the [vue-router documentation](http://router.vuejs.org/en/nested.html)):

```javascript
/* routes.js */

// Import the router
import {Router} from 'meteor/akryum:vue-router';

// Components
import Home from '/imports/ui/Home.vue';
import Forum from '/imports/ui/Forum.vue';
import Apollo from '/imports/ui/Apollo.vue';

// Simple routes
Router.map({
  '/': {
    name: 'home',
    component: Home
  },
  '/forum': {
    name: 'forum',
    component: Forum
  },
  '/apollo': {
    name: 'apollo',
    component: Apollo
  }
});
```

### App menu

Use the `v-link` directive to add dynamic links that take to different routes in your app ([more info](http://router.vuejs.org/en/link.html)):

```html
<!-- AppMenu.vue -->
<template>
<div class="app-menu">
  <a v-link="{ name:'home', exact: true }">Home</a>
  <a v-link="{ name:'forum' }">Forum</a>
  <a v-link="{ name:'apollo' }">Apollo</a>
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

Create a vue component with a `<router-view></router-view>` element, that will contain the route content ([more info](http://router.vuejs.org/en/view.html)):

```html
<!-- AppLayout.vue -->
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

### Starting the router

Then import the routes and start the router in your client:

```javascript
/* client.js */

// Imports
import {Meteor} from 'meteor/meteor';
import {Router} from 'meteor/akryum:vue-router';

// Routes
import './routes';

// App layout
import AppLayout from '/imports/ui/AppLayout.vue';

// App start
Meteor.startup(() => {
  // Start the router and create root vue instance
  Router.start({
    history: true,
    saveScrollPosition: true
  }, AppLayout, 'app');
});
```

The most important method is `Router.start(options, App, el, callback)` that takes these parameters:

 - `options` allow you to customize the router behavior ([more info](http://router.vuejs.org/en/options.html)).
 - `App` is a vue component definition that will be used as the main layout and root instance. **Note that the router cannot be started with Vue instances.**
 - `el` determines which HTML element the root instance will be attached on ([more info](https://vuejs.org/api/#el)). Can be a CSS selector string or an actual element.
 - `callback` is an optional function which will be called when the router app's initial render is complete.

For more info about router start, check the [vue-router documentation](http://router.vuejs.org/en/api/start.html).

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

LICENCE ISC - Created by Guillaume CHAU (@Akryum)
