# Integrate pug with vue single-file components for Meteor

Compatibility: **Vue 1.x, Vue 2.x**

This meteor package adds [pug](http://pugjs.org) support in your single-file `.vue` components.

## Installation

    meteor add akryum:vue-pug


## Usage

```html
<template lang="pug">
.post
  .message {{data.message}}
    a.action(@click="removePost") x
</template>
```

---

LICENCE ISC - Created by Guillaume CHAU (@Akryum)
