<template>
  <div>
    <button @action="increment(parseInt(amount))" :label="$t('pages.vuex.increment')"></button>
    <input class="input" v-model="amount" type="number" :placeholder="$t('pages.vuex.amount')" />
  </div>
</template>

<script>
import {increment} from '/imports/vuex/actions';

export default {
  data() {
    return {
      amount: 1
    }
  },
  vuex: {
    actions: {
      increment
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
  margin-bottom: 4px;
}
</style>
