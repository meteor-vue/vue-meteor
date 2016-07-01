# Changelog

## 0.2.2 - 2016/07/01

 - Fixed a leak related to the tracker `watch()` option.

## 0.2.0 - 2016/07/01

 - (BREAKING CHANGE) Actions: the two parameters `store` and `state` are now merged into one first parameter: `{store:{...}, state:{...}}`. You can use ES6 destructuring if you only need one of them: `myAction({state}) {...}`.
 - Actions: use `return this.callMethod(name, ...args, [callback])` to call a meteor method and return back a promise to the ui component.
