// Libs
import {Meteor} from 'meteor/meteor';
import {Vue} from 'meteor/akryum:vue';

// Api
import {Threads, Posts} from '/imports/api/collections';
import '/imports/api/methods';

// Subscriptions cache
Vue.subsCache = new SubsCache({
    expireAfter: 15,
    cacheLimit: -1
});
// We can replace the default subcription function with our own
// Here we replace the native subscribe() with a cached one
Vue.config.meteor.subscribe = function(...args) {
  args.unshift(Vue.subsCache.expireAfter); // First arg
  return Vue.subsCache.subscribeFor.apply(Vue.subsCache, args);
};

/// Components

// Thread list items
Vue.component('thread-item', {
  template: `<div class="thread-item" :class="css" @click="select">{{data.name}}</div>`,
  props: ['data', 'selected'],
  computed: {
    css() {
      return {
        selected: this.selected
      };
    }
  },
  methods: {
    select () {
      this.$emit('select')
    }
  }
});

// Post
Vue.component('post', {
  template: `<div class="post">
    <div class="message">{{data.message}} <a class="action" @click="removePost">x</a></div>
  </div>`,
  props: ['data'],
  methods: {
    removePost () {
      Meteor.call('posts.remove', this.data._id);
    }
  }
});

// Thread
Vue.component('thread', {
  template: `<div class="thread">
    <h2>{{data.name}}</h2>
    <div class="actions">
    <a @click="removeThread">Delete thread</a>
    </div>
    <form @submit.prevent="createPost"><input v-model="newPostMessage" placeholder="Type new message" required/></form>
    <post v-for="post in posts" :data="post"></post>
  </div>`,
  props: ['id'],
  data () {
    return {
      newPostMessage: '', // Vue data
      posts: [], // Initialize your meteor data
      data: {} // Initialize your meteor data
    }
  },
  // Meteor-specific options
  meteor: {
    // Subscriptions
    subscribe: {
      // Here we subscribe to the subscription called 'posts'
      // with the 'thread_id' parameter passed in an array of parameters
      'posts': function() {
        return [this.id] // Subscription params
      }
    },
    // Reactive data
    data: {
      // This will update the 'data' object property on the Vue instance
      data: {
        // We declare which params depends on reactive vue properties
        params () {
          // Here you can use Vue reactive properties
          // Don't use Meteor reactive sources!
          return {
            id: this.id
          };
        },
        // This will be refresh each time above params changes from Vue
        // Then it calls Tracker.autorun() to refresh the result
        // each time a Meteor reactive source changes
        update ({id}) {
          // Here you can use Meteor reactive sources
          // like cursors or reactive vars
          // Don't use Vue reactive properties!
          return Threads.findOne(id);
        }
      },
      // Thread posts
      posts: {
        // Vue Reactivity
        params () {
          return {
            id: this.id // thread_id
          };
        },
        // Meteor Reactivity
        update ({id}) {
          return Posts.find({
            thread_id: id
          }, {
            sort: {created: -1}
          });
        }
      }
    }
  },
  methods: {
    createPost () {
      // Meteor method call
      Meteor.call('posts.create', this.data._id, this.newPostMessage, (err, post_id) => {
        if(err) {
          alert('An error occured while creating post.');
          console.error(err);
        } else {
          this.newPostMessage = '';
        }
      })
    },
    removeThread () {
      // Meteor method call
      Meteor.call('threads.remove', this.data._id);
    }
  }
});

// Main app
new Vue({
  el: 'body',
  replace: false,
  template: `<h1>Forum ({{count}})</h1>
  <form @submit.prevent="createThread"><input v-model="newThreadName" placeholder="Type new thread name" required/></form>
  <thread-item v-for="thread in threads" :data="thread" :selected="thread._id === selectedThreadId" @select="selectThread(thread._id)"></thread-item>
  <hr/>
  <thread v-if="selectedThread" :id="selectedThreadId"></thread>`,
  data () {
    return {
      newThreadName: '', // Vue data
      selectedThreadId: null, // Vue data
      selectedThread: null, // Initialize your meteor data
      threads: [] // Initialize your meteor data
    }
  },
  computed: {
    count () {
      return this.threads.length;
    }
  },
  meteor: {
    // Subscriptions
    subscribe: {
      'threads': []
    },
    // Reactive Data
    data: {
      // Threads list
      // You can use a function directly if you don't need
      // parameters coming from the Vue instance
      threads () {
        return Threads.find({}, {
          sort: {date: -1}
        });
      },
      // Selected thread
      selectedThread: {
        // Vue Reactivity
        params () {
          return {
            id: this.selectedThreadId
          };
        },
        // Meteor Reactivity
        update ({id}) {
          return Threads.findOne(id);
        }
      }
    }
  },
  methods: {
    createThread () {
      // Meteor method call
      Meteor.call('threads.create', this.newThreadName, (err, thread_id) => {
        if(err) {
          alert('An error occured while creating thread.');
          console.error(err);
        } else {
          this.newThreadName = '';
          this.selectThread(thread_id);
        }
      })
    },
    selectThread (id) {
      this.selectedThreadId = id;
    }
  }
});
