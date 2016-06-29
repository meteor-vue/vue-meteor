<template>
  <div class="vue-demo">
    <h1>{{ $t('pages.vuex.title') }}</h1>
    <links-menu :links="links"></links-menu>
    <router-view></router-view>
  </div>
</template>

<script>
import store from '/imports/vuex/store'

export default {
  store,
  data() {
    return {
      links: [
        { name: 'vuex', exact: true, lb: 'pages.vuex.counter' },
        { name: 'vuex.collection', lb: 'pages.vuex.collection' }
      ]
    }
  }
}
</script>
