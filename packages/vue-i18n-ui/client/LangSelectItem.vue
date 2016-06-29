<template>
  <a class="vue-ui-lang-item" :class="langItemClasses" @click="handleClick" @keyup.space="handleClick" role="button" tabindex="0" aria-describedby="Select the {{lang}} language">
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
        'vue-ui-selected': this.selected
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
.vue-ui-lang-item {
  &.vue-ui-selected {
    background-color: #d1eeeb !important;
  }
}
</style>
