# Checks and auto-installs your atmosphere package npm dependencies

In your package folder, add a `npm.json`:

```json
{
  "dependencies": {
    "socket.io-client": "^1.4.6"
  },
  "devDependencies": {
    "vue": "^1.0.24"
  }
}
```

And in your `package.js` add the `npm-check` package:

```javascript
Package.onUse(function(api) {
  api.versionsFrom('1.3.2.4');
  api.use('akryum:npm-check@0.0.1');
  api.use('ecmascript');
  api.mainModule('index.js', 'client');
});
```
