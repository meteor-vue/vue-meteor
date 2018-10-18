<p align="center"><img src="https://github.com/Akryum/vue-meteor/raw/master/vue%2Bmeteor.png"></p>

<p align="center">
<a href="https://meteor.com/"><img src="https://img.shields.io/badge/meteor-1.7.0.5-blue.svg"/></a>
<a href="https://vuejs.org/"><img src="https://img.shields.io/badge/vue-1.x-green.svg"/> <img src="https://img.shields.io/badge/vue-2.5.17-brightgreen.svg"/></a>
</p>

<p align="center">
  <a href="https://www.patreon.com/akryum" target="_blank">
    <img src="https://c5.patreon.com/external/logo/become_a_patron_button.png" alt="Become a Patreon">
  </a>
</p>

## Sponsors

### Silver

<p align="center">
  <a href="https://vueschool.io/" target="_blank">
    <img src="https://vueschool.io/img/logo/vueschool_logo_multicolor.svg" alt="VueSchool logo" width="200px">
  </a>
</p>

<br>
<br>
<br>

vue+meteor is a set of packages to help you create awesome apps quickly and efficiently with two great web technologies:

- [vuejs](http://vuejs.org/) is the frontend
- [meteor](http://meteor.com/) is the platform (client, server, database, network)

You will be able to [use meteor data inside Vue](https://github.com/Akryum/vue-meteor-tracker#vue-integration-for-meteor) or [write `.vue` files in your meteor project](https://github.com/Akryum/meteor-vue-component/tree/master/packages/vue-component).

### [Complete Example/Demo Project](https://github.com/Akryum/vue-meteor-demo)

## Quick Packages Links

Here is a list of recommended packages for developping a meteor+vue app:

- [:package: `vue-meteor-tracker`](https://github.com/Akryum/vue-meteor-tracker) (meteor tracker integration)
- [:package: `akryum:vue-component`](https://github.com/Akryum/meteor-vue-component/tree/master/packages/vue-component) (vue component files)
- [:package: `akryum:vue-router2`](https://github.com/Akryum/meteor-vue-component/tree/master/packages/vue-router2) (`vue-router` 2.x helpers)
- [:package: `vue-apollo`](https://github.com/Akryum/vue-apollo) (apollo integration)
- [:package: `vuejs:blaze-integration`](https://github.com/meteor-vue/blaze-integration) (integrate Vue and Blaze)
- [:package: `vue-supply`](https://github.com/Akryum/vue-supply) (use reactive data & automatic subscriptions in components and vuex store)
- [:package: `akryum:vue-ssr`](https://github.com/Akryum/vue-meteor/tree/master/packages/vue-ssr) (Server-Side Rendering)

## Resources

### Examples

- [Guide Example](https://github.com/meteor-vue/guide)
- [TodoMVC](https://github.com/meteor-vue/todomvc)
- [Complete Example/Demo Project](https://github.com/Akryum/vue-meteor-demo)

<br>

### Meteor & Tracker data integration ![vue](https://img.shields.io/badge/vue-1.x-green.svg) ![vue](https://img.shields.io/badge/vue-2.x-brightgreen.svg)

Declarative subscriptions and meteor reactive data

[:package: See Usage in npm vue-meteor-tracker package](https://github.com/Akryum/vue-meteor-tracker#vue-integration-for-meteor)

<br>

### Single-file component ![vue](https://img.shields.io/badge/vue-1.x-green.svg) ![vue](https://img.shields.io/badge/vue-2.x-brightgreen.svg)

It allows you to write your components in [this format](https://vuejs.org/v2/guide/single-file-components.html) with hot-reloading support.

[:package: See Usage in arkyum:vue-component package](https://github.com/Akryum/meteor-vue-component/tree/master/packages/vue-component#usage)

<br>

### Routing ![vue](https://img.shields.io/badge/vue-2.x-brightgreen.svg)

Routing for Vue 2.x and Meteor using [vue-router](https://github.com/vuejs/vue-router).

[:package: See Installation & Usage in arkyum:vue-router2 package](https://github.com/Akryum/meteor-vue-component/tree/master/packages/vue-router2#installation)

[Example app](https://github.com/Akryum/meteor-vue2-example-routing)

<br>

### Apollo integration ![vue](https://img.shields.io/badge/vue-1.x-green.svg) ![vue](https://img.shields.io/badge/vue-2.x-brightgreen.svg)

Use apollo in your vue component!

[:package: See Installation & Usage in the vue-apollo npm package](https://github.com/Akryum/vue-apollo)

<br>

### Server-side rendering ![vue](https://img.shields.io/badge/vue-2.x-brightgreen.svg)

Very easy way to render your fonrtend on the server automatically when a user first loads the app.

[:package: See Installation & Usage in the akryum:vue-ssr package](https://github.com/meteor-vue/vue-meteor/tree/master/packages/vue-ssr#installation)

<br>

### Integrate Blaze  ![vue](https://img.shields.io/badge/vue-2.x-brightgreen.svg)

Render Blaze templates in Vue components and the other way around!

[:package: See Installation & Usage in the vuejs:blaze-integration package](https://github.com/meteor-vue/blaze-integration)


<br>


## Vue 1.x

See `old` branch.

---

## Features & Roadmap

Currently supported and possible future features (in no particular order) are:

 - [x] Declarative subscriptions and meteor reactive data ![vue](https://img.shields.io/badge/vue-1.x-green.svg) ![vue](https://img.shields.io/badge/vue-2.x-brightgreen.svg)
 - [x] Single-file components (.vue) with basic support of `<template>`, `<script>` and `<style>` (with optional `scoped` attribute) ![vue](https://img.shields.io/badge/vue-1.x-green.svg) ![vue](https://img.shields.io/badge/vue-2.x-brightgreen.svg)
 - [x] Instant Hot-reloading of components ![vue](https://img.shields.io/badge/vue-1.x-green.svg) ![vue](https://img.shields.io/badge/vue-2.x-brightgreen.svg)
 - [x] `lang` attribute on `<style>` in .vue files ![vue](https://img.shields.io/badge/vue-1.x-green.svg) ![vue](https://img.shields.io/badge/vue-2.x-brightgreen.svg)
 - [x] Less official integration in .vue files ![vue](https://img.shields.io/badge/vue-1.x-green.svg) ![vue](https://img.shields.io/badge/vue-2.x-brightgreen.svg)
 - [x] Sass official integration in .vue files ![vue](https://img.shields.io/badge/vue-1.x-green.svg) ![vue](https://img.shields.io/badge/vue-2.x-brightgreen.svg)
 - [x] Stylus official integration in .vue files ![vue](https://img.shields.io/badge/vue-1.x-green.svg) ![vue](https://img.shields.io/badge/vue-2.x-brightgreen.svg)
 - [x] `lang` attribute on `<template>` in .vue files ![vue](https://img.shields.io/badge/vue-1.x-green.svg) ![vue](https://img.shields.io/badge/vue-2.x-brightgreen.svg)
 - [x] Jade official integration in .vue file ![vue](https://img.shields.io/badge/vue-1.x-green.svg) ![vue](https://img.shields.io/badge/vue-2.x-brightgreen.svg)
 - [x] `lang` attribute on `<script>` in .vue files ![vue](https://img.shields.io/badge/vue-1.x-green.svg) ![vue](https://img.shields.io/badge/vue-2.x-brightgreen.svg)
 - [x] Coffeescript official integration in .vue files ![vue](https://img.shields.io/badge/vue-1.x-green.svg) ![vue](https://img.shields.io/badge/vue-2.x-brightgreen.svg)
 - [x] Apollo client integration ![vue](https://img.shields.io/badge/vue-1.x-green.svg) ![vue](https://img.shields.io/badge/vue-2.x-brightgreen.svg)
 - [x] Easy routing with vue-router out-of-the-box integration & fast-render ![vue](https://img.shields.io/badge/vue-1.x-green.svg) ![vue](https://img.shields.io/badge/vue-2.x-brightgreen.svg)
 - [x] Easy localization with vue-i18n out-of-the-box integration, auto-detection, server-side injection and key-in-hand ui ![vue](https://img.shields.io/badge/vue-1.x-green.svg)
 - [x] Easy state management with vuex integration ![vue](https://img.shields.io/badge/vue-1.x-green.svg)
 - [x] Use Blaze templates in your vue app ![vue](https://img.shields.io/badge/vue-1.x-green.svg) ![vue](https://img.shields.io/badge/vue-2.x-brightgreen.svg)
 - [x] `module` attribute on `<style>` in .vue files
 - [x] Typescript support in .vue files ![vue](https://img.shields.io/badge/vue-1.x-green.svg) ![vue](https://img.shields.io/badge/vue-2.x-brightgreen.svg)
 - [x] Server-side rendering ![vue](https://img.shields.io/badge/vue-2.x-brightgreen.svg)
 - [x] `src` attribute support in `.vue` files ![vue](https://img.shields.io/badge/vue-1.x-green.svg) ![vue](https://img.shields.io/badge/vue-2.x-brightgreen.svg)
 - [x] Apollo Server-side rendering ![vue](https://img.shields.io/badge/vue-2.x-brightgreen.svg)
 - [x] Meteor 1.5 code-splitting ![vue](https://img.shields.io/badge/vue-2.x-brightgreen.svg)

Track the project progress [here](https://github.com/Akryum/meteor-vue-component/milestones).

## Get involved

This project is very much a work-in-progress, so your help will be greatly appreciated!
Feel free to contribute by opening a PR or an issue (but check before if the topic already exists).

### Development project

Clone this repository and [the demo project](https://github.com/Akryum/vue-meteor-demo) and type in the demo project directory:

    ln -s ../vue-meteor/packages packages
    meteor npm install
    meteor

---

LICENCE ISC - Created by Guillaume CHAU (@Akryum)
