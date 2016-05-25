<template>
  <div>
    <h1>Hello {{name}}!</h1>
    <input v-model="name" placeholder="Enter your name" />
  </div>
</template>

<script>
export default {
  data () {
    return {
      name: 'World'
    }
  }
}
</script>

<style>
h1 {
  color: #40b883;
}
</style>
