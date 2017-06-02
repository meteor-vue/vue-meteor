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

<style scoped>
.thread-item {
  padding: 12px;
  cursor: default;
  user-select: none;
}

.thread-item:hover {
    color: #40b883;
}

.thread-item.selected {
    background: #caecde;
    border-radius: 3px;
}
</style>
