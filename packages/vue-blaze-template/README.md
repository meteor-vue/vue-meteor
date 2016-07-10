# Use Blaze templates in Vue components

## Installation

    meteor add akryum:vue-blaze-template

## Usage

The `v-blaze` directive allow you to use any Blaze template in your Vue component. It expect an expression.

Static template name (**don't forget the single quote**):

```html
<div v-blaze="'loginButtons'"></div>
```

Dynamic template name (will switch the template reactively):

```html
<template>
  <div v-blaze="templateName"></div>
</template>

<script>
export default {
  data: () => ({
    templateName: 'loginButtons'
  })
}
</script>
```

[Example app](https://github.com/Akryum/meteor-vue-blaze/tree/render-blaze)
