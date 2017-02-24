# Changelog

## 0.8.6 - 2017-02-21

 - CSS Modules: New `<style>` attribute `module` & `$style` component property (see [PR](https://github.com/Akryum/meteor-vue-component/pull/117)). Thanks @nathantreid
 - Better Meteor port detection and new `VUE_DEV_SERVER_URL` env variable (see [PR](https://github.com/Akryum/meteor-vue-component/pull/100)). Thanks @MartinBucko

## 0.8.5

 - Initial `lang="css"` support.

## 0.8.4 - 2017-02-02

 - Fixed [#101](https://github.com/Akryum/meteor-vue-component/issues/101) (for Meteor 1.4.2.4+)

## 0.8.3 - 2017-02-01

 - Relaxed vue-template-compiler into `akryum:vue-compiler`
 - Fixed manually imported component files in production mode. Need an upstream fix for auto-imported components.

## 0.8.1 - 2017-01-04

 - Performance improvements and es2015 transpilation in templates for `.vue` files with `vue-template-es2015-compiler`.

## 0.8.0 - 2017-01-02

 - The components `name` option will be set by default depending on the filename. [#99](https://github.com/Akryum/meteor-vue-component/issues/99)
 - Fix sourcemaps [#46](https://github.com/Akryum/meteor-vue-component/issues/46)
 - Enabled CSS autoprefixer. Turn it off with `<style autoprefix="off">`. [#4](https://github.com/Akryum/meteor-vue-component/issues/4)
 - New `data-v-source-file` attribute on development `<style>` tags.

## 0.7.1 - 2016-09-28

 - Fixed single quote error in templates

## 0.7.0 - 2016-09-28

 - Compatible with Vue 2.x

## 0.6.7 - 2016-09-28

 - Try to use the meteor port + 3
 - Env variable changed to HM_PORT

## 0.6.4 - 2016-07-19

 - Revamped the error logging: errors are now less verbose and a lot more detailed and useful.

## 0.6.3 - 2016-07-18

 - The compiler can now watch imported files and hot-reload/rebuild the components that uses them.
 - The dependency watching has been implemented for less.

## 0.6.1 - 2016-07-08

 - The `.vueignore` file inside a folder will only apply to that folder, similar to `.gitignore` files.

## 0.6.0 - 2016-07-08

 - The compiler now parses `.vueignores` files that contains regexes for each line. The `.vue` files matching theses regexes will be ignored by the compiler.

## 0.5.4 - 2016-07-07

 - Fixed [Issue #41](https://github.com/Akryum/meteor-vue-component/issues/41).

## 0.5.0 - 2016-06-28

 - No longer requires component files to be named `.global.vue` outside the `imports` folder.

## 0.4.0 - 2016-06-24

 - Added akryum:vue-i18n support.
 - The component definitions have the new `packageName` attribute.
 - Fix [Issue #5](https://github.com/Akryum/meteor-vue-component/issues/5)

## 0.3.8 - 2016-06-20

 - Fix [Issue #35](https://github.com/Akryum/meteor-vue-component/issues/35)

## 0.3.5 - 2016-06-16

 - Fix [Issue #33](https://github.com/Akryum/meteor-vue-component/issues/33)

## 0.3.4 - 2016-06-16

 - Fix [Issue #32](https://github.com/Akryum/meteor-vue-component/issues/32)

## 0.3.3 - 2016-06-15

 - Fix nested `<template>` tags for Vue conditional rendering [#29](https://github.com/Akryum/meteor-vue-component/issues/29)

## 0.3.2 - 2016-06-15

 - Support for meteor 1.3.3
 - Fix [Issue #28](https://github.com/Akryum/meteor-vue-component/issues/28)

## 0.3.0  - 2016-06-13

 - Added support for `lang` attribute on `<script>` tags.

## 0.2.1 - 2016-06-10

 - Fix [Issue #26](https://github.com/Akryum/meteor-vue-component/issues/26)

## 0.2.0 - 2016-06-08

 - Adds support for `lang` attribute in `<template>` tags.

## 0.1.2 - 2016-06-06

 - Fix locally registered component constructors not updating [#6](https://github.com/Akryum/meteor-vue-component/issues/6)

## 0.1.1 - 2016-06-06

 - Fix relative imports not working Issue [#7](https://github.com/Akryum/meteor-vue-component/issues/7)
 - Globally registered component constructors are now correctly updated Issue [#6](https://github.com/Akryum/meteor-vue-component/issues/6)

## 0.1.0 - 2016-06-05

 - Instant hot-push reloading of vue components.

## 0.0.5 - 2016-06-03

 - `.global.vue` files outside of the `imports` directory are automatically registered as custom tags. The default tag name is the name of the file in kebab-case, and you can set your own with the `name` attribute in the component options.

## 0.0.4 - 2016-06-03

 - Removed remaining debug `console.log`

## 0.0.3 - 2016-06-01

 - `lang` attribute implementation for `<style>` tags. Now exposes a config object to add lang support with other packages: `global.vue.lang` (see [akryum:vue-less](https://github.com/Akryum/meteor-vue-component/tree/master/packages/vue-less)).

## 0.0.2 - 2016-05-30

 - Removed autoprefixer postcss plugin due to a huge hit on the plugin loading time.
