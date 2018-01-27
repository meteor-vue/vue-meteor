module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  // https://github.com/feross/standard/blob/master/RULES.md#javascript-standard-style
  extends: 'standard',
  // required to lint *.vue files
  /* plugins: [
    'html'
  ], */
  env: {
    browser: true,
  },
  // Global vars
  globals: {
    'Package': true,
    'Meteor': true,
    'Tracker': true,
  },
  // add your custom rules here
  'rules': {
    // allow paren-less arrow functions
    'arrow-parens': 'off',
    // allow async-await
    'generator-star-spacing': 'off',
    // allow debugger during development
    'no-debugger': 'warn',
    // trailing comma
    'comma-dangle': ['error', 'always-multiline'],
    // beware of returning assignement
    'no-return-assign': 'off',
    'no-extend-native': 'warn',
    'no-undef': 'warn',
    'standard/no-callback-literal': 'warn',
  }
}
