// Libs
import {Meteor} from 'meteor/meteor';
import {Vue} from 'meteor/akryum:vue';
import {Router} from 'meteor/akryum:vue-router';

// Api
import '/imports/api/methods';

// Routes
import './routes';

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

// App layout
import AppLayout from '/imports/ui/AppLayout.vue';

// App start
Meteor.startup(function() {
  // Start the router and create root vue instance
  Router.start({
    history: true,
    saveScrollPosition: true
  }, AppLayout, '#app');
});

Test = 'test';
