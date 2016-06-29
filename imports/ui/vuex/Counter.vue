<template>
<div class="counter">
  <div class="info">
    {{ $t('pages.vuex.counter.info') }}
  </div>
  <display></display>
  <increment></increment>
  <decrement></decrement>
</div>
</template>

<script>
import Display from './Display.vue'
import Increment from './Increment.vue'
import Decrement from './Decrement.vue'

export default {
  components: {
    Display,
    Increment,
    Decrement
  }
}
</script>
