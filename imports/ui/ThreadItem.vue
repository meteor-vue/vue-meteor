<template>
  <div class="thread-item" :class="css" @click="select">{{data.name}}</div>
</template>

<script>
export default {
  props: ['data', 'selected'],
  computed: {
    css() {
      return {
        selected: this.selected
      };
    }
  },
  methods: {
    select () {
      this.$emit('select')
    }
  }
}
</script>
