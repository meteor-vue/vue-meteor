import {Store} from 'meteor/akryum:vuex';
import CollectionTest from './modules/collection-test';

const store = new Store();

store.state({
  counter: 0
});

store.mutations({
  INCREMENT(state, amount) {
    state.counter += amount;
  },
  DECREMENT(state, amount) {
    state.counter -= amount;
  }
});

store.addModule(CollectionTest);

export default store.exportStore();
