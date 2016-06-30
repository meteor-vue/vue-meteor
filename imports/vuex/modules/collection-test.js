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
    store.dispatch('THREADS_SORT_DATE', -1*state.sortDate);
  }
});

// Meteor integration

import {Threads} from '/imports/api/collections';

s.addTrackers({
  threads() {
    let sub;
    return {
      // Initialize the meteor data
      init(data) {
        data.threads = []
      },
      // When the tracker is being used
      activate() {
        sub = Meteor.subscribe('threads');
      },
      // When the tracker is no longer used
      deactivate() {
        sub.stop();
      },
      // Watch store changes
      watch(state) {
        return {
          sortDate: state.sortDate
        }
      },
      // Update the meteor data
      update(data, {sortDate}) {
        let threads = Threads.find({}, {
          sort: {date: sortDate}
        }).fetch();
        console.log("updated threads", threads.length);
        data.threads = threads;
      },
      // Getters
      getters: {
        getThreads(data) {
          return data.threads;
        }
      },
      // If true, activate automatically
      autoActivate: false
    }
  }
});

export default s;
