# Vue Single-file component for Meteor

It allows you to write your components in [this format](https://vuejs.org/guide/application.html#Single-File-Components):
![screenshot](http://blog.evanyou.me/images/vue-component.png)

## Installation


    meteor add akryum:vue-component


## Usage

**Warning: the `lang` attribute on `<template>` tags is not supported yet!**

Official lang packages for `<style>` tag:

 - [akryum:vue-less](https://github.com/Akryum/meteor-vue-component/tree/master/packages/vue-less)

The component file must include:

 - Maximum one `<template>` tag containing the template html of your component,
 - Maximum one `<script>` tag containing the component options object in javascript,
 - And as many `<style>` tags as you wish.

You must export your code with the ES2015 statement `export default` in your `<script>` tag:


```html
<script>
// ES2015 Javascript with support for import statements
// See the 'ecmascript' meteor package for more info
export default {
    ready() {
        console.log('Hello world!');
    }
}
</script>
```

By default, the css added with `<style>` tags will be applied to your entire app. But you can add the `scoped` attribute to any `<style>` tag in your component file so that the css is only applied to this specific component:


```html
<style scoped>
/* Will only be applied to this component <a> elements */
a {
    color: red;
}
</style>
```



You can then import your .vue component files in your meteor code:


```javascript
// Post
import Post from '/imports/ui/Post.vue';
Vue.component('post', Post);
```


---

LICENCE ISC - Created by Guillaume CHAU (@Akryum)
