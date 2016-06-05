# Vue Single-file component for Meteor

It allows you to write your components in [this format](https://vuejs.org/guide/application.html#Single-File-Components) (with hot-reloading support):
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

### Manual import

You can then import your .vue component files in your meteor code:


```javascript
// Post
import Post from '/imports/ui/Post.vue';
Vue.component('post', Post);
```

### Global vue components

`.global.vue` files outside of the `imports` directory are automatically registered as custom tags. The default tag name is the name of the file in kebab-case, and you can set your own with the `name` attribute in the component options.

![screenshot](./global_component_file_tree.png)

In the example above, the `Post.global.vue` component is automatically available in your vue templates as `<post>`.

**The global component files shouldn't be inside an `imports` directory, or else they will not be automatically added to your app.**

You can override the default naming behavior by setting the `name` option in your component:

```html
<script>
export default {
  name: 'selected-thread',
  // other options...
}
</script>
```

Here your component will be available as `<selected-thread>` regardless of the file name.

---

LICENCE ISC - Created by Guillaume CHAU (@Akryum)
