<template lang="jade">
.app-menu
  a(v-for="link in links", v-link="link") {{$t(link.lb)}}
</template>

<script>
export default {
  props:['links']
}
</script>

<style scoped lang="sass">
@import ~imports/ui/colors.sass

.app-menu
  margin: 32px 0
  text-align: center

  a
    display: inline-block
    padding: 6px
    margin: 0 6px
    border-radius: 3px
    &.v-link-active
      background: $app-color
      color: white
</style>
