# Changelog

## 0.2.0 - 2016/07/06

 - (BREAKING CHANGE) You now have to create the router instance from the `Router` class in your client.
 - (BREAKING CHANGE) The `Router` class now extends the native vue-router class directly. `Router.lib` removed.
 - You can now call `Router.configure(router => {...})` to use vue-router before the router is created or started, regardless of the file load order.
