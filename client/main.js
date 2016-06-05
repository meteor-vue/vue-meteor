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

// Thread list items
/*import ThreadItem from '/imports/ui/ThreadItem.vue';
Vue.component('thread-item', ThreadItem);*/

// Post
/*import Post from '/imports/ui/Post.vue';
Vue.component('post', Post);*/

// Thread
/*import Thread from '/imports/ui/Thread.vue';
Vue.component('thread', Thread);*/

// Apollo
import Apollo from '/imports/ui/Apollo.vue';
Vue.component('apollo', Apollo);

// Main app
import App from '/imports/ui/App.vue';
Vue.component('app', App);
new Vue({
  el: 'body',
  replace: false
});
