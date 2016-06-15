# Changelog

## 0.3.3 - 2016/06/15

 - Fix nested <template> tags for Vue conditional rendering [#29](https://github.com/Akryum/meteor-vue-component/issues/29)

## 0.3.2 - 2016/06/15

 - Support for meteor 1.3.3
 - Fix [Issue #28](https://github.com/Akryum/meteor-vue-component/issues/28)

## 0.3.0  - 2016/06/13

 - Added support for `lang` attribute on `<script>` tags.

## 0.2.1 - 2016/06/10

 - Fix [Issue #26](https://github.com/Akryum/meteor-vue-component/issues/26)

## 0.2.0 - 2016/06/08

 - Adds support for `lang` attribute in `<template>` tags.

## 0.1.2 - 2016/06/06

 - Fix locally registered component constructors not updating [#6](https://github.com/Akryum/meteor-vue-component/issues/6)

## 0.1.1 - 2016/06/06

 - Fix relative imports not working Issue [#7](https://github.com/Akryum/meteor-vue-component/issues/7)
 - Globally registered component constructors are now correctly updated Issue [#6](https://github.com/Akryum/meteor-vue-component/issues/6)

## 0.1.0 - 2016/06/05

 - Instant hot-push reloading of vue components.

## 0.0.5 - 2016/06/03

 - `.global.vue` files outside of the `imports` directory are automatically registered as custom tags. The default tag name is the name of the file in kebab-case, and you can set your own with the `name` attribute in the component options.

## 0.0.4 - 2016/06/03

 - Removed remaining debug `console.log`

## 0.0.3 - 2016/06/01

 - `lang` attribute implementation for `<style>` tags. Now exposes a config object to add lang support with other packages: `global.vue.lang` (see [akryum:vue-less](https://github.com/Akryum/meteor-vue-component/tree/master/packages/vue-less)).

## 0.0.2 - 2016/05/30

 - Removed autoprefixer postcss plugin due to a huge hit on the plugin loading time.
