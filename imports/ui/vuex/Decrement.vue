<template>
  <div>
    <button @action="decrement(parseInt(amount))" :label="$t('pages.vuex.decrement')"></button>
    <input class="input" v-model="amount" type="number" :placeholder="$t('pages.vuex.amount')" />
  </div>
</template>

<script>
import {decrement} from '/imports/vuex/actions';

export default {
  data() {
    return {
      amount: 1
    }
  },
  vuex: {
    actions: {
      decrement
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
