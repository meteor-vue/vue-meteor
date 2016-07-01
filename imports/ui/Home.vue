<template lang="jade">
.home
  h1 {{$t('pages.home.welcome')}}
  p {{$t('pages.home.text1')}}&nbsp;
    a(href="https://github.com/Akryum/meteor-vue-component") {{$t('pages.home.more')}}
  img.logo(src="/img/vue.png")
  img.logo(src="/img/meteor.png")

  p
    button2(:label="$t('pages.home.button')", @action="clicked=true", v-if="!clicked")
</template>

<script>
export default {
  data: () => ({
    clicked: false
  })
}
</script>

<style scoped lang="less">
.home {
  text-align: center;
}

img.logo {
  max-width: 101px;
  margin: 12px;
}
</style>
