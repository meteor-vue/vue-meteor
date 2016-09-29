import {StoreSubModule} from 'meteor/akryum:vuex';

const subModule = new StoreSubModule('forum');

subModule.addState({
  sortDate: -1
});

subModule.addGetters({
  sortDate: state => state.sortDate
});

subModule.addMutations({
  THREADS_SORT_DATE(state, order) {
    state.sortDate = order;
  }
});

subModule.addActions({
  toggleSortDate({store, state}) {
    // state is immutable
    store.dispatch('THREADS_SORT_DATE', -1*state.sortDate);
  }
});

// Meteor integration

// Import a meteor collection
import {Threads} from '/imports/api/collections';

// Add trackers to the store module
subModule.addTrackers({
  // Name of the tracker
  threads() {
    // Context variables
    let sub;

    // You can execute arbitrary code here

    return {
      // Initialize the meteor data
      init(data) {
        data.threads = []
      },
      /*
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
      */
      subscribe: {
        threads: [],
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
        console.log(data);
        // Meteor data query
        let threads = Threads.find({}, {
          sort: {date: sortDate}
        }).fetch();
        console.log("updated threads", threads.length);

        // Update the module meteor data
        data.threads = Object.freeze(threads);
      },
      // Getters
      // These are computed properties and are cached by vue
      getters: {
        // Getters should follow the get<Name> naming convention
        getThreads: data => data.threads
      },
      // If true, the tracker will be activated right away
      // Else, you need to add it on a vue component or call tracker.addClient()
      isActivated: false
    }
  }
});

export default subModule;
