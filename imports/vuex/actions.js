export function increment(store, amount) {
  store.dispatch('INCREMENT', amount);
}

export function decrement(store, amount) {
  store.dispatch('DECREMENT', amount);
}
