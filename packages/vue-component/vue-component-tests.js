// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by vue-component.js.
import { name as packageName } from "meteor/vue-component";

// Write your tests here!
// Here is an example.
Tinytest.add('vue-component - example', function (test) {
  test.equal(packageName, "vue-component");
});
