<template>
  <div class="app">
    <h1>Forum ({{count}})</h1>
    <form @submit.prevent="createThread"><input v-model="newThreadName" placeholder="Type new thread name" required/></form>
    <thread-item v-for="thread in threads" :data="thread" :selected="thread._id === selectedThreadId" @select="selectThread(thread._id)"></thread-item>
    <hr/>
    <thread v-if="selectedThread" :id="selectedThreadId"></thread>
  </div>
</template>

<script>
import {Meteor} from 'meteor/meteor';
import {Threads, Posts} from '/imports/api/collections';

export default {
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
}
</script>
