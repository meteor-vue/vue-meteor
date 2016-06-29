<template lang="jade">
.app-layout
  locale-select.lang-select
  links-menu(:links="links")
  router-view
</template>

<script>
import {LocaleSelect} from 'meteor/akryum:vue-i18n-ui';

export default {
  data() {
    return {
      links: [
        { name: 'home', exact: true, lb: 'pages.home.title' },
        { name: 'forum', lb: 'pages.forum.title' },
        { name: 'apollo', lb: 'pages.apollo.title' },
        { name: 'vuex', lb: 'pages.vuex.title' }
      ]
    }
  },
  components: {
    LocaleSelect
  }
}
</script>

<style scoped lang="less">
.lang-select {
  position: absolute;
  top: 12px;
  right: 12px;
}
</style>
