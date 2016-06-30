import {StoreModule} from 'meteor/akryum:vuex';

const s = new StoreModule('collection');

s.addState({
  sortDate: -1
});

s.addGetters({
  sortDate: state => state.sortDate
});

s.addMutations({
  THREADS_SORT_DATE(state, order) {
    state.sortDate = order;
  }
});

s.addActions({
  toggleSortDate(store, state) {
    // state is immutable
    store.dispatch('THREADS_SORT_DATE', -1*state.sortDate);
  }
});

// Meteor integration

import {Threads} from '/imports/api/collections';

s.addTrackers({
  // Name of the tracker
  threads() {
    // Context variables
    let sub;
    return {
      // Initialize the meteor data
      init(data) {
        data.threads = []
      },
      // When the tracker is being used
      activate() {
        // Subscribe to the publication
        sub = Meteor.subscribe('threads');
      },
      // When the tracker is no longer used
      deactivate() {
        // Stop the subscription
        sub.stop();
      },
      // Watch store changes
      // State is relative to the module
      watch(state) {
        // state is immutable
        return {
          sortDate: state.sortDate
        }
      },
      // Update the meteor data
      // Data is relative to the module
      update(data, {sortDate}) {
        // Meteor data query
        let threads = Threads.find({}, {
          sort: {date: sortDate}
        }).fetch();
        console.log("updated threads", threads.length);

        // Update the module meteor data
        data.threads = threads;
      },
      // Getters
      // These are computed properties and are cached by vue
      getters: {
        // Getters should follow the get<Name> naming convention
        getThreads(data) {
          return data.threads;
        }
      },
      // If true, activate automatically
      // Else, you need to call tracker.addClient()
      autoActivate: false
    }
  }
});

export default s;
