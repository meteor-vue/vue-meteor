<template>
  <div class="post">
    <div class="message">{{data.message}} <a class="action" @click="removePost">x</a></div>
  </div>
</template>

<script>
import {Meteor} from 'meteor/meteor';

export default {
  props: ['data'],
  methods: {
    removePost () {
      Meteor.call('posts.remove', this.data._id);
    }
  }
}
</script>

<style scoped lang="less">
// Import
@import "~imports/ui/mixins.import.less";

a {
  text-decoration: underline;
}

.post {
    .message {
        // Mixin
        .padding(12px);

        color: green;
    }
}
</style>

<style>
.message {
  color: grey;
}
</style>
