import {StoreModule} from 'meteor/akryum:vuex';
import {Threads} from '/imports/api/collections';

const s = new StoreModule('collection');

s.addState({
  threads: [],
  sortDate: -1
});

s.addGetters({
  threads: state => state.threads,
  sortDate: state => state.sortDate
});

s.addMutations({
  THREADS_SORT_DATE(state, order) {
    state.sortDate = order;
    // Call this in your tracker dependencies
    s.updateTracker('threads');
  }
});

s.addActions({
  toggleSortDate(store, state) {
    store.dispatch('THREADS_SORT_DATE', -1*state.sortDate);
  }
});

s.addTrackers({
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

export default s;
