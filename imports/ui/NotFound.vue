<template>
<div class="not-found">
  <div class="banner">
    <img src="/img/droids.jpg" />
  </div>
  <div class="hero">
    Not Found
  </div>
  <div>
    This is not the page you are looking for. <a v-link="{name:'home'}">Return home</a>
  </div>
</div>
</template>

<style scoped lang="sass">
.not-found
  margin-top: 2*42px
  text-align: center

  .hero
    font-size: 2.5em
    color: #666
    margin: 12px

  .banner
    img
      max-width: 100%
      border-radius: 5px
</style>
