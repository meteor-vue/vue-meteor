<template>
  <div>
    <h3>{{ $t('pages.vuex.count', {count: counter}) }}</h3>
  </div>
</template>

<script>
export default {
  vuex: {
    getters: {
      counter: state => state.counter
    }
  }
}
</script>
