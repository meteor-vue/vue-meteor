import {Meteor} from 'meteor/meteor';
import {Threads, Posts} from './collections';

Meteor.publish('threads', function() {
  return Threads.find();
});

Meteor.publish('posts', function(thread_id) {
  check(thread_id, String);

  return Posts.find({
    thread_id
  });
});
