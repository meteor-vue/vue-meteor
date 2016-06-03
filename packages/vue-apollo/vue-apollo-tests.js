// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by vue-apollo.js.
import { name as packageName } from "meteor/vue-apollo";

// Write your tests here!
// Here is an example.
Tinytest.add('vue-apollo - example', function (test) {
  test.equal(packageName, "vue-apollo");
});
