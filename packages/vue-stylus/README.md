# Integrate stylus with vue single-file components for Meteor

Compatibility: **Vue 1.x, Vue 2.x**

This meteor package adds [stylus](http://stylus-lang.com/) support in your single-file `.vue` components. [nib](https://github.com/tj/nib) is also supported.

## Installation

    meteor add akryum:vue-stylus


## Usage

```html
<style scoped lang="stylus">
.home
  text-align: center

  img.logo
    max-width: 101px
    margin: 12px
</style>
```

You can import files with absolute, relative path or a folder:

```html
<style scoped lang="stylus">
// Absolute path in the project
@import "~imports/ui/mixins.import.styl";
// Relative path
@import "./mixins.import.styl";
// Folder path will import 'index.styl'
@import "./styles";
</style>
```

---

LICENCE ISC - Created by Guillaume CHAU (@Akryum)
