<template lang="jade">
.home
  h1 {{$t('pages.home.welcome')}}
  p {{$t('pages.home.text1')}}&nbsp;
    a(href="https://github.com/Akryum/meteor-vue-component") {{$t('pages.home.more')}}
  img.logo(src="/img/vue.png")
  img.logo(src="/img/meteor.png")

  p
    button2(:label="$t('pages.home.button')", @action="handleClick", v-if="!clicked")
    .counter {{ count }}
</template>

<script>
export default {
  data: () => ({
    count: 0,
  }),
  methods: {
    handleClick() {
      this.count += 42;
    },
  },
};
</script>

<style scoped lang="stylus">
@import '~imports/ui/pixels.styl'

.home
  text-align center

  img.logo
    max-width 101px
    margin margin

  .counter
    color grey
    margin-top 32px
</style>
