<template lang="jade">
.post
  .message {{data.message}}
    a.action(@click="removePost") x
</template>

<script lang="coffee">
`import {Meteor} from 'meteor/meteor'`

return {
  props: [ 'data' ]
  methods:
    removePost: ->
      Meteor.call 'posts.remove', @data._id
}
</script>

<!-- Project path test -->
<style scoped lang="less">
// Import
@import "~imports/ui/mixins.less";

a {
  text-decoration: underline;
}

.post {
  .message {
    // Mixin
    .padding(12px);
  }
}
</style>

<!-- Relative path test -->
<style scoped lang="less">
// Import
@import "../../imports/ui/mixins.less";

.post {
  .message {
    .border-radius(3px);
  }
}
</style>

<!-- Project path test -->
<style lang="sass">
@import ~imports/ui/colors.sass

.message
  color: $message-color
</style>

<!-- Relative path test -->
<style lang="sass">
@import ../../imports/ui/colors.sass

.message
  background-color: $message-background
</style>
