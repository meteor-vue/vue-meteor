
let Watcher
export function getWatcher (vm) {
  if (!Watcher) {
    const noop = function () {}
    const unwatch = vm.$watch(noop, noop)
    Watcher = vm._watchers[0].constructor
    unwatch()
  }
  return Watcher
}

let Dep
export function getDep (vm) {
  if (!Dep) {
    Dep = vm._data.__ob__.dep.constructor
  }
  return Dep
}
