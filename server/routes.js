import {Router} from 'meteor/akryum:vue-router';
import {Threads} from '/imports/api/collections';

Router.map({
  '/forum': {
    sendData(params, queryParams) {
      return Threads.find().fetch();
    }
  }
});
