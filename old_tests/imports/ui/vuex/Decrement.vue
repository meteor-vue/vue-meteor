<template>
  <div>
    <button @action="decrement(parseInt(amount))" :label="$t('pages.vuex.counter.decrement')"></button>
    <input class="input" v-model="amount" type="number" :placeholder="$t('pages.vuex.counter.amount')" />
  </div>
</template>

<script>
export default {
  data: () => ({
    amount: 1
  }),
  vuex: root => ({
    actions: {
      decrement: root.actions.decrement
    }
  })
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
