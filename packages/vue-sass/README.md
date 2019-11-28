# Integrate sass and scss with vue single-file components for Meteor

Compatibility: **Vue 1.x, Vue 2.x**

This meteor package adds [sass](http://sass-lang.com) support in your single-file `.vue` components.

## Installation

    meteor add akryum:vue-sass


## Usage

```html
<style lang="scss">
$message-color: grey;

.message {
  color: $message-color;
}
</style>

<style lang="sass">
$message-color: grey

.message
  color: $message-color
</style>
```

You can import files with absolute or relative path:

```html
<style scoped lang="sass">
// Absolute path in the project
@import ~imports/ui/colors.sass
// Relative path
@import ../../imports/ui/colors.sass
</style>
```

## Config

In project `package.json`, you can add more folders for the sass file resolution:

```json
{
  "vue": {
    "css": {
      "sass": {
        "includePaths": [
          "node_modules"
        ],
      }
    }
  },
}
```

---

LICENCE ISC - Created by Guillaume CHAU (@Akryum)
