// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by vue-less.js.
import { name as packageName } from "meteor/vue-less";

// Write your tests here!
// Here is an example.
Tinytest.add('vue-less - example', function (test) {
  test.equal(packageName, "vue-less");
});
