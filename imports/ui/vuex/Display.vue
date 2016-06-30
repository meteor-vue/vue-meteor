<template>
  <div>
    <h3>{{ $t('pages.vuex.counter.count', {count: counter}) }} ({{status}})</h3>
  </div>
</template>

<script>
export default {
  vuex(root) {
    return {
      getters: root.getters
    };
  }
}
</script>
