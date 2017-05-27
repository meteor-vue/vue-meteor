# Integrate coffee-script with vue single-file components for Meteor

Compatibility: **Vue 1.x, Vue 2.x**

This meteor package adds [coffee-script](http://coffeescript.org/) support in your single-file `.vue` components.

## Installation

    meteor add akryum:vue-coffee


## Usage

```html
<script lang="coffee">
import { Meteor } from 'meteor/meteor'

return
  props: [ 'data' ]
  methods:
    removePost: ->
      Meteor.call 'posts.remove', @data._id
</script>
```

---

LICENCE ISC - Created by Guillaume CHAU (@Akryum)
