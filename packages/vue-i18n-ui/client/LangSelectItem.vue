<template>
  <div class="lang-item" :class="langItemClasses" @click="handleClick">
    <slot></slot>
  </div>
</template>

<script>
import {Vue} from 'meteor/akryum:vue';

export default {
  props:['lang'],
  computed: {
    selected() {
      return this.lang === Vue.config.lang;
    },
    langItemClasses() {
      return {
        selected: this.selected
      }
    }
  },
  methods: {
    handleClick() {
      this.$emit('select', this.lang);
    }
  }
}
</script>

<style scoped lang="less">
.lang-item {
  &.selected {
    background-color: #d1eeeb;
  }
}
</style>
