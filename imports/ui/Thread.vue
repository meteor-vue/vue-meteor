<template>
  <div class="thread">
    <h2>{{data.name}}</h2>
    <div class="actions">
    <a @click="removeThread">Delete thread</a>
    </div>
    <form @submit.prevent="createPost"><input v-model="newPostMessage" placeholder="Type new message" required/></form>
    <post v-for="post in posts" :data="post"></post>
  </div>
</template>

<script>
import {Meteor} from 'meteor/meteor';
import {Threads, Posts} from '/imports/api/collections';

export default {
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
      // We subscribe to the subscription called 'posts'
      // with the 'thread_id' parameter passed in an array of parameters
      'posts': function() {
        // Here you can use Vue reactive properties
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
}
</script>
