<template lang="jade">
.app-menu
  a(v-link="{ name:'home', exact: true }") Home
  a(v-link="{ name:'forum' }") Forum
  a(v-link="{ name:'apollo' }") Apollo
</template>

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
