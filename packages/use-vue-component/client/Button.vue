<template>
<div class="button" @click="handleClick">
  <span class="label">{{label}}</span>
</div>
</template>

<script>
export default {
  props: ['label'],
  methods: {
    handleClick() {
      this.$emit('click', this);
    }
  }
}
</script>

<style scoped>
.button {
  display: inline-block;
  background-color: #40b883;
  padding: 12px;
  border-radius: 3px;
  color: white;
  cursor: pointer;
  transition: background-color 0.1s;
  -webkit-touch-callout: none; /* iOS Safari */
  -webkit-user-select: none;   /* Chrome/Safari/Opera */
  -khtml-user-select: none;    /* Konqueror */
  -moz-user-select: none;      /* Firefox */
  -ms-user-select: none;       /* Internet Explorer/Edge */
  user-select: none;
}

.button:hover {
  background-color: #a0ddc4;
}
</style>
