// Libs
import {Meteor} from 'meteor/meteor';
import {Vue} from 'meteor/akryum:vue';
import {Router} from 'meteor/akryum:vue-router';

// Api
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

// Router
const router = new Router({
  history: true,
  saveScrollPosition: true
});

// App layout
import AppLayout from '/imports/ui/AppLayout.vue';

// Not found
import NotFound from '/imports/ui/NotFound.vue';
router.on('*', {
  component: NotFound
});

// App start
Meteor.startup(function() {
  // Start the router and create root vue instance
  router.start(AppLayout, '#app');
});
