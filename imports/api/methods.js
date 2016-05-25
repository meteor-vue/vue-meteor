import {Meteor} from 'meteor/meteor';
import {Threads, Posts} from './collections';

Meteor.methods({
  'threads.create': function(name) {
    check(name, String);

    let _id = Threads.insert({
      name,
      created: new Date(),
      date: new Date()
    })

    return _id;
  },
  'threads.remove': function(_id) {
    check(_id, String);
    Posts.remove({
      thread_id: _id
    });
    Threads.remove(_id);
  },
  'posts.create': function(thread_id, message) {
    check(thread_id, String);
    check(message, String);

    let thread = Threads.findOne(thread_id);
    if(!thread) {
      throw new Meteor.Error('Thread not found');
    }

    let _id = Posts.insert({
      thread_id,
      message,
      created: new Date()
    });

    Threads.update(thread_id, {
      $set: {
        date: new Date()
      }
    });

    return _id;
  },
  'posts.remove': function(_id) {
    check(_id, String);
    Posts.remove(_id);
  }
});
