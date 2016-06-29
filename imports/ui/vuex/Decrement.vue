<template>
  <div>
    <button @action="decrement(parseInt(amount))" :label="$t('pages.vuex.counter.decrement')"></button>
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
  vuex: {
    actions: {
      decrement: Store.actions.decrement
    }
  }
}
</script>

<style scoped lang="less">
.input {
  display: inline-block;
  width: 80px;
  padding: 11px;
  margin-left: 4px;
}
</style>
