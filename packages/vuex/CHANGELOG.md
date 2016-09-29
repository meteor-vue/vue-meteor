# Changelog

## 0.4.0 - 2016-09-29

 - Trackers are now replaced by Resources, that are automatically activated and deactivated when needed.

## 0.3.0 - 2016-07-06

 - Updated to vuex 1.0.0-rc.2 (some breaking changes may apply, see [release notes](https://github.com/vuejs/vuex/releases/tag/v1.0.0-rc))
 - (BREAKING CHANGE) Store module property `root` has been renamed to `$root`.
 - Submodules can now contain nested submodules.
 - New module property `$parent`.

## 0.2.2 - 2016-07-01

 - Fixed a leak related to the tracker `watch()` option.

## 0.2.0 - 2016-07-01

 - (BREAKING CHANGE) Actions: the two parameters `store` and `state` are now merged into one first parameter: `{store:{...}, state:{...}}`. You can use ES6 destructuring if you only need one of them: `myAction({state}) {...}`.
 - Actions: use `return this.callMethod(name, ...args, [callback])` to call a meteor method and return back a promise to the ui component.
