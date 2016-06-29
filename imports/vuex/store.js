import {Store} from 'meteor/akryum:vuex';
import CollectionTest from './modules/collection-test';

const s = new Store();

s.addState({
  counter: 0
});

s.addMutations({
  INCREMENT(state, amount) {
    state.counter += amount;
  },
  DECREMENT(state, amount) {
    state.counter -= amount;
  }
});

s.addActions({
  increment(store, state, amount) {
    store.dispatch('INCREMENT', amount);
  },
  decrement(store, state, amount) {
    store.dispatch('DECREMENT', amount);
  }
})

s.addModule(CollectionTest);

export const store = s.exportStore();
export default s;
