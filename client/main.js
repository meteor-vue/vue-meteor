// Libs
import {Meteor} from 'meteor/meteor';
import {Vue} from 'meteor/akryum:vue';

// Api
import {Threads, Posts} from '/imports/api/collections';
import '/imports/api/methods';

// Subscriptions cache
const subsCache = new SubsCache({
    expireAfter: 15,
    cacheLimit: -1
});
// We can replace the default subcription function with our own
// Here we replace the native subscribe() with a cached one
Vue.config.meteor.subscribe = function(...args) {
  args.unshift(subsCache.expireAfter); // First arg
  return subsCache.subscribeFor.apply(subsCache, args);
};

/// Components

// Apollo
import Apollo from '/imports/ui/Apollo.vue';
Vue.component('apollo', Apollo);

// Main app
import App from '/imports/ui/App.vue';

Meteor.startup(() => {
  new Vue({
    el: 'body',
    replace: false,
    components: {
      App
    }
  });
});
