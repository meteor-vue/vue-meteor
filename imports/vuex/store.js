import {Store} from 'meteor/akryum:vuex';
import CollectionTest from './modules/collection-test';

const s = new Store();

// Add some initial state
s.addState({
  counter: 0
});

// Using centralized getters is good practice
// They are also cached by vue just like computed props
s.addGetters({
  counter: state => state.counter,
  status: state => {
    if(state.counter === 0) {
      return 'None'
    } else if(state.counter === 1) {
      return 'One'
    } else {
      return 'Many'
    }
  }
});

// Only mutations can change the store state
s.addMutations({
  INCREMENT(state, amount) {
    state.counter += amount;
  },
  DECREMENT(state, amount) {
    state.counter -= amount;
  }
});

// Using centralized actions is good practice
s.addActions({
  increment(store, state, amount) {
    // state is immutable
    store.dispatch('INCREMENT', amount);
  },
  decrement(store, state, amount) {
    // state is immutable
    store.dispatch('DECREMENT', amount);
  }
});

s.addModule(CollectionTest);

// Export the vuex native store
export const store = s.exportStore();
