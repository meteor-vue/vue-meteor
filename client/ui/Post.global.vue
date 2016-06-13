<template lang="jade">
.post
  .message {{data.message}}
    a.action(@click="removePost") x
</template>

<script lang="coffee">
`import {Meteor} from 'meteor/meteor'`

return {
  props: [ 'data' ]
  methods: removePost: ->
    Meteor.call 'posts.remove', @data._id
    return
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
