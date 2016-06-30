<template>
  <div>
    <button @action="increment(parseInt(amount))" :label="$t('pages.vuex.counter.increment')"></button>
    <input class="input" v-model="amount" type="number" :placeholder="$t('pages.vuex.counter.amount')" />
  </div>
</template>

<script>
import Store from '/imports/vuex/store';

export default {
  data() {
    return {
      amount: 1
    }
  },
  vuex(root) {
    return {
      actions: {
        increment: root.actions.increment
      }
    };
  }
}
</script>

<style scoped lang="less">
.input {
  display: inline-block;
  width: 80px;
  padding: 11px;
  margin-left: 4px;
  margin-bottom: 4px;
}
</style>
