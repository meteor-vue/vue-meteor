import {StoreModule} from 'meteor/akryum:vuex';
import {Threads} from '/imports/api/collections';

const store = new StoreModule('collection');

store.state({
  threads: [],
  sortDate: -1
});

store.mutations({
  THREADS_SORT_DATE(state, order) {
    state.sortDate = order;
    // Call this in your tracker dependencies
    store.updateTracker('threads');
  }
});

store.trackers({
  threads() {
    let sub;
    return {
      activate() {
        sub = Meteor.subscribe('threads');
      },
      deactivate() {
        sub.stop();
      },
      // Mutate the store state
      mutate(state) {
        let threads = Threads.find({}, {
          sort: {date: state.sortDate}
        }).fetch();
        console.log("updated threads", threads.length);
        state.threads = threads;
      },
      // If true, activate automatically
      autoActivate: false
    }
  }
});

export default store;
