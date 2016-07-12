<template lang="jade">
.app-layout
  locale-select.lang-select
  links-menu(:links="links")
  router-view
</template>

<script>
import {LocaleSelect} from 'meteor/akryum:vue-i18n-ui';

export default {
  data: () => ({
    links: [
      { name: 'home', exact: true, lb: 'pages.home.title' },
      { name: 'forum', lb: 'pages.forum.title' },
      { name: 'apollo', lb: 'pages.apollo.title' },
      { name: 'vuex', lb: 'pages.vuex.title' }
    ]
  }),
  components: {
    LocaleSelect
  }
}
</script>

<style scoped lang="less">
.lang-select {
  position: absolute;
  top: 12px;
  right: 12px;
}
</style>


<style>
body, input {
    font-family: sans-serif;
    font-size: 12pt;
}

body {
    max-width: 400px;
    margin: auto;
    padding: 24px;
}

a {
  color: #40b883;
  cursor: pointer;
  text-decoration: none;
}

a:hover {
  color: #a0ddc4;
}

h1, h2 {
    margin: 0;
    text-align: center;
}

h1 {
    color: #40b883;
    font-weight: lighter;
}

h2 {
    color: #999;
    font-weight: lighter;
}

input {
    padding: 6px 12px;
    border: solid 1px #ccc;
    border-radius: 3px;
    display: block;
    width: 100%;
    box-sizing: border-box;
}

form {
    margin: 12px 0;
}

hr {
    border: none;
    height: 1px;
    background: #40b883;
}

.thread .actions {
  padding: 0 12px;
}

.post .action {
  float: right;
}

.info {
  color: grey;
  padding: 12px;
  margin: 12px 0;
  background: #f3f3f3;
  border-radius: 5px;
  text-align: left;
}
</style>
