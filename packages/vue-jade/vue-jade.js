global.vue = global.vue || {}
global.vue.lang = global.vue.lang || {}

import jade from 'jade';
import { Meteor } from 'meteor/meteor';

global.vue.lang.jade = Meteor.wrapAsync(function({ source, basePath, inputFile }, cb) {
  var fn = jade.compile(source, {
    filename: basePath,
    fileMode: true
  });

  var html = fn();

  cb(null, {
    template: html
  });
});
