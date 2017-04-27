global.vue = global.vue || {}
global.vue.lang = global.vue.lang || {}

import pug from 'pug';
import { Meteor } from 'meteor/meteor';

global.vue.lang.pug = Meteor.wrapAsync(function({ source, basePath, inputFile }, cb) {
  var fn = pug.compile(source, {
    filename: basePath,
    fileMode: true
  });

  var html = fn();

  cb(null, {
    template: html
  });
});
