<template>
  <a class="lang-item" :class="langItemClasses" @click="handleClick" @keyup.space="handleClick" role="button" tabindex="0" aria-describedby="Select the {{lang}} language">
    <slot></slot>
  </a>
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
