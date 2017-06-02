<template>
  <div class="app">
    <h1>{{$t('pages.forum.title')}} ({{count}})</h1>
    <form @submit.prevent="createThread"><input v-model="newThreadName" :placeholder="$t('pages.forum.thread.add')" required/></form>
    <thread-item v-for="thread in threads" :data="thread" :selected="thread._id === selectedThreadId" @select="selectThread(thread._id)"></thread-item>
    <hr />

    <!-- Nested <template></template> test -->
    <template v-if="selectedThread">
      <selected-thread :id="selectedThreadId"></selected-thread>
    </template>
  </div>
</template>

<script>
import {Meteor} from 'meteor/meteor';
//import {Threads, Posts} from '/imports/api/collections';
import {Threads, Posts} from '../api/collections';

import ThreadItem from './ThreadItem.vue';

export default {
  data: () => ({
    // Vue data
    newThreadName: '',
    selectedThreadId: null,

    // Initialize your meteor data
    selectedThread: null,
    threads: []
  }),
  computed: {
    count () {
      return this.threads.length;
    }
  },
  // Meteor-specific options
  meteor: {
    // Subscriptions
    subscribe: {
      threads: []
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
  },
  ready () {
    console.log('hello world!');
  },
  components: {
    ThreadItem
  }
}
</script>
