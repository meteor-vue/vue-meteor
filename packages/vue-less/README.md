# Integrate less with vue single-file components for Meteor

Compatibility: **Vue 1.x, Vue 2.x**

This meteor package adds [less](http://lesscss.org/) support in your single-file `.vue` components.

## Installation

    meteor add akryum:vue-less


## Usage

```html
<style scoped lang="less">
// Import
@import "~imports/ui/mixins.import.less";

.post {
    .message {
        // Mixin
        .padding(12px);
    }
}
</style>
```

You can import files with absolute or relative path:

```html
<style scoped lang="less">
// Absolute path in the project
@import "~imports/ui/mixins.import.less";
// Relative path
@import "./mixins.import.less";
</style>
```

---

LICENCE ISC - Created by Guillaume CHAU (@Akryum)
