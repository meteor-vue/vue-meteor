# Internationalization for Vue in Meteor

Vue internationalization integrated in your meteor app using [vue-i18n](https://github.com/kazupon/vue-i18n).

See the [example app](https://github.com/Akryum/meteor-vue-example-i18n)

## Installation


    meteor add akryum:vue-i18n

## Usage

### Locale files

The translated strings must be put in json *locale files*. Each locale file name must end with `.<lang>.i18n.json` where `<lang>` is the corresponding language code. For example, the following english strings can be put in the `app.en.i18n.json` file:

```json
{
  "pages": {
    "home": "Home",
    "about": "About"
  }
}
```

In the file name, the part before `.en.i18n.json` is arbitrary. Here is another example file `pages.fr.i18n.json` in french:

```json
{
  "pages": {
    "home": "Accueil",
    "about": "A propos"
  }
}
```

All your locale files of the same language will be merged together in one locale data object. For example, if you add another file `pages2.fr.i18n.json`:

```json
{
  "pages": {
    "pricing": "Tarifs",
    "blog": "Blog"
  }
}
```

The resulting `fr` locale will be:

```json
{
  "pages": {
    "home": "Accueil",
    "about": "A propos",
    "pricing": "Tarifs",
    "blog": "Blog"
  }
}
```

### Displaying translated text

#### Inside your app

In your vue components, you can use the `$t(key, ...args)` method to translate text. The key is a dot-delimited path in the locale object. For example, `'pages.home'` will look for the `'home'` string in the `'pages'` object.

The options arguments can be used to format the strings ([see bellow](#formatting)).

Here is an example in a component template:

```html
<template>
  <div class="menu">
    <a>{{ $t('pages.home') }}</a>
    <a>{{ $t('pages.about') }}</a>
    <a>{{ $t('pages.pricing') }}</a>
    <a>{{ $t('pages.blog') }}</a>
  </div>
</template>
```

#### Inside a package

Locale files inside a package will have its data wrapped in a `packages.<name>` object, the name being the package name with `:` and `-` replaced by `_`. For example, the `akryum:vue-i18n-ui` package contains the following locale file:

```json
{
  "remember": {
    "info": "Do you want to remember your choice?"
  }
}
```

The string can be accessed with the `'packages.akryum_vue_i18n_ui.remember.info'` key:

```html
<template>
  <div class="info">{{ $t('packages.akryum_vue_i18n_ui.remember.info') }}</div>
</template>
```

In the vue components of your package, use the `$tp` method instead of `$t`, it will conveniently prefix the keys for you:

```html
<template>
  <div class="info">{{ $tp('remember.info') }}</div>
</template>
```

### Translate a package

If you use components from a package that hasn't been translated in languages you need, you can add the translations in your own locale files. Use the special `packages.<name>` object seen above:

```json
{
  "packages": {
    "akryum_vue_i18n_ui": {
      "remember": {
        "info": "Voulez-vous sauvegarder ce choix?"
      }
    }
  }
}
```

### Available language list

By default, the *application code* locale files will be used to define the supported language list of your app: this means that if you don't put locale files outside of your packages, there will be no available language to your users.

That way, third-party packages localized in languages you do not intend to support don't add all the languages they support to your app.

For example, if you put three files `app.en.i18n.json`, `app.fr.i18n.json` and `app.es.i18n.json` in your *application code* (not inside a package), the `'en'`, `'fr'` and `'es'` locales will be available in your app.

You can override this behavior with a `langs.json` file containing an array of supported languages:

```json
["en", "fr"]
```

### Formatting

#### HTML formatting
In some cases you might want to rendered your translation as an HTML message and not a static string.

```json
{
  "message": {
    "hello": "hello <br> world"
  }
}
```

Template the following (notice the triple brackets):

```html
<p>{{{ $t('message.hello') }}}</p>
```

Output the following (instead of the message pre formatted)

```html
<p>hello
<!--<br> exists but is rendered as html and not a string-->
world</p>
```

#### Named formatting

Locale the following:

```json
{
  "message": {
    "hello": "{msg} world"
  }
}
```

Template the following:

```html
<p>{{ $t('message.hello', { msg: "hello"}) }}</p>
```

Output the following:

```html
<p>hello world</p>
```

#### List formatting

Locale the following:

```json
{
  "message": {
    "hello": "{0} world"
  }
}
```

Template the following:

```html
<p>{{ $t('message.hello', ["hello"]) }}</p>
```

Output the following:

```html
<p>hello world</p>
```

#### Support ruby on rails i18n format

Locale the following:

```json
{
  "message": {
    "hello": "%{msg} world"
  }
}
```

Template the following:

```html
<p>{{ $t('message.hello', { msg: "hello"}) }}</p>
```

Output the following:

```html
<p>hello world</p>
```

### Automatic language selection

At this point, you can already try your localizations if you open your app: by default, the user language is automatically selected. To auto-detect the right language, the following happens under-the-hood:

 1. When the user open the app, the server looks for a `_vueLang` cookie in the incoming http request containing a language tag like `'fr'`.
 2. Then, it negotiates the language with the `accept-language` http header with [locale](https://github.com/florrain/locale).
 3. If still not found, it uses the default language or the first language it finds if the default language is not available.
 4. The server injects the locale data in the html response.
 5. The client renders the injected locale as soon as the page is ready.
 6. If there is a different `_vueLang` item in html5 `localStorage`, it asynchronously loads this locale.
 7. Else, the client uses `window.navigator.userLanguage` or `window.navigator.language` to check the user language. If it doesn't match with the one chosen by the server, it asynchronously loads this locale.

The default language used by the server is `'en'`. You can change it with the `DEFAULT_LANG` environment variable.

### I18n API

On the client, the package exposes a `I18n` vue instance:

```javascript
import I18n from 'meteor/akryum:vue-i18n';
```

#### Properties

Name | Type | Description
--- | --- | ---
`autoLocale` | String | Locale automatically selected ([see Automatic language selection](#automatic-language-selection)).
`browserLocale` | String | Locale natively determined by the browser.
`error` | String | Last error message.
`languageList` | Array | List of available languages. Initialized by the server ([see Automatic language selection](#automatic-language-selection)).
`loading` | Boolean | Is `true` if a new locale is being loaded and not yet applied.
`savedLangOption` | String | Locale saved by the user.

#### Methods

##### `setLocale(lang, remember=false)`

Loads the new locale and save it (it will override automatic detection).

Arguments:

 - `lang` (String): Language code
 - `remember` (Boolean, default `false`): If `true`, save the language choice.

---

##### `setAutoLocale(remember=false)`

 Automatically detects the user language and apply it to the app.

 Arguments:

  - `remember` (Boolean, default `false`): If `true`, unset the eventual saved language so that it will be automatically detected the next time.

---

##### `setSavedLocale()`

Loads the eventual saved language and apply it.

---

##### `saveLang(lang)`

Set the currently saved language (without loading it), so next time the user opens your app, it will use this language and override the automatic language detection. To load it, use `loadLocale`.

Arguments:

 - `lang` (String): Language code

---

##### `loadLocale(lang)`

Loads a locale with the specified language code. Returns a promise.

Arguments:

 - `lang` (String): Language code

### Iso codes

There is a language code list available from the package:

```javascript
import {IsoLangs} from 'meteor/akryum:vue-i18n';

console.log(IsoLangs['en']);

/*
{
    "name":"English",
    "nativeName":"English"
}
*/

console.log(IsoLangs['fr']);

/*
{
    "name":"French",
    "nativeName":"Français"
}
*/
```

### Premade ui

See the [akryum:vue-i18n-ui](https://github.com/Akryum/meteor-vue-component/tree/master/packages/vue-i18n-ui) package.

---

## Next steps

- [Example project](https://github.com/Akryum/meteor-vue-example-i18n)
- [Add routing to your app](https://github.com/Akryum/meteor-vue-component/tree/master/packages/vue-router#installation)
- [Manage your app state with a vuex store](https://github.com/Akryum/meteor-vue-component/tree/master/packages/vuex#installation)
- [Integrate apollo](https://github.com/Akryum/meteor-vue-component/tree/master/packages/vue-apollo#installation)

---

LICENCE ISC - Created by Guillaume CHAU (@Akryum)
