import { Meteor } from 'meteor/meteor';
import { Threads, Posts } from './collections';

Threads.lastsThreads = function(limit) {
  return Threads.find({}, { sort: { date: -1 }, limit: limit });
};

Meteor.publish('lasts-threads', function(limit){
    return Threads.lastsThreads(limit);
});

Meteor.publish('threads', function() {
  return Threads.find();
});

Meteor.publish('posts', function(thread_id) {
  check(thread_id, String);

  return Posts.find({
    thread_id
  });
});
