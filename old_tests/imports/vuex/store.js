import {StoreModule} from 'meteor/akryum:vuex';

const root = new StoreModule();

// Add some initial state
root.addState({
  counter: 0
});

// Using centralized getters is good practice
// They are also cached by vue just like computed props
root.addGetters({
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
root.addMutations({
  INCREMENT(state, amount) {
    state.counter += amount;
  },
  DECREMENT(state, amount) {
    state.counter -= amount;
  }
});

// Using centralized actions is good practice
root.addActions({
  increment({store}, amount) {
    // state is immutable
    store.dispatch('INCREMENT', amount);
  },
  decrement({store}, amount) {
    // state is immutable
    store.dispatch('DECREMENT', amount);
  }
});

// Submodule
import forum from './modules/forum';
root.addModule(forum);

// Export the vuex native store
export const store = root.exportStore();
