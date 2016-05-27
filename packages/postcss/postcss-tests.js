// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by postcss.js.
import { name as packageName } from "meteor/postcss";

// Write your tests here!
// Here is an example.
Tinytest.add('postcss - example', function (test) {
  test.equal(packageName, "postcss");
});
