# Vue as a Meteor UI layer

**This project is experimental.**

Tested with Meteor 1.3.4

This project contains new meteor packages to help build [meteor](http://meteor.com/) apps with first-class [vuejs](http://vuejs.org/) integration as the ui layer.

## Features

Currently supported and possible future features (in no particular order) are:

 - [x] Declarative subscriptions and meteor reactive data
 - [x] Single-file components (.vue) with basic support of `<template>`, `<script>` and `<style>` (with optional `scoped` attribute)
 - [x] `lang` attribute on `<style>` in .vue files
 - [x] Less official integration in .vue files
 - [x] Apollo client integration
 - [x] Auto register components with file name ending with .global.vue
 - [x] Instant Hot-reloading of components
 - [x] `lang` attribute on `<template>` in .vue files
 - [x] Jade official integration in .vue file
 - [x] `lang` attribute on `<script>` in .vue files
 - [x] Coffeescript official integration in .vue files
 - [x] Sass official integration in .vue files
 - [x] Easy routing with vue-router out-of-the-box integration & fast-render
 - [x] Easy localization with vue-i18n out-of-the-box integration, auto-detection, server-side injection and key-in-hand ui
 - [ ] *Typescript official integration in .vue files*
 - [ ] *Easy state management with vuex integration (needs discussion, suggestions welcomed)*
 - [ ] *Lazy-loading of components*

Track the project progress [here](https://github.com/Akryum/meteor-vue-component/milestones).

## Usage

### New project without blaze

See the [simple example project](https://github.com/Akryum/meteor-vue-example).

### New project with blaze

See the [blaze example project](https://github.com/Akryum/meteor-vue-blaze).

### Development project

Clone this repository and type in the project directory:

    meteor npm install
    meteor

### Meteor & Tracker data integration

Declarative subscriptions and meteor reactive data

[See Usage in akryum:vue package](https://github.com/Akryum/meteor-vue-component/tree/master/packages/vue#usage)

### Single-file component

It allows you to write your components in [this format](https://vuejs.org/guide/application.html#Single-File-Components) with hot-reloading support.

[See Usage in arkyum:vue-component package](https://github.com/Akryum/meteor-vue-component/tree/master/packages/vue-component#usage)

### Routing

Routing for vue and meteor using [vue-router](https://github.com/vuejs/vue-router).

[See Installation & Usage in arkyum:vue-router package](https://github.com/Akryum/meteor-vue-component/tree/master/packages/vue-router#installation)

[See the routing example](https://github.com/Akryum/meteor-vue-example-routing)

### Apollo integration

Use apollo in your vue component!

[See Installation & Usage in akryum:vue-apollo package](https://github.com/Akryum/meteor-vue-component/tree/master/packages/vue-apollo#installation)

### Localization

Translate your app quickly and easily with [vue-i18n](https://github.com/kazupon/vue-i18n).

[See Installation & Usage in akryum:vue-i18n package](https://github.com/Akryum/meteor-vue-component/tree/master/packages/vue-i18n#installation)

[Premade selection ui in akryum:vue-i18n-ui package](https://github.com/Akryum/meteor-vue-component/tree/master/packages/vue-i18n-ui)

[Example app](https://github.com/Akryum/meteor-vue-example-i18n)

## Get involved

This project is very much a work-in-progress, so your help will be greatly appreciated!  
Feel free to contribute by opening a PR or an issue (but check before if the topic already exists).

---

LICENCE ISC - Created by Guillaume CHAU (@Akryum)
