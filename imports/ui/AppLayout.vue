<template lang="jade">
.app-layout
  app-menu
  router-view
</template>

<script>
import AppMenu from '/imports/ui/AppMenu.vue';

export default {
  components: {
    AppMenu
  }
}
</script>
