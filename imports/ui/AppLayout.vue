<template lang="jade">
.app-layout
  locale-select.lang-select
  app-menu
  router-view
</template>

<script>
import AppMenu from '/imports/ui/AppMenu.vue';
import {LocaleSelect} from 'meteor/akryum:vue-i18n-ui';

export default {
  components: {
    AppMenu,
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
