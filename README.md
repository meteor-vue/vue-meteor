<p align="center"><img src="./vue%2Bmeteor.png"></p>

<p align="center">
<a href="https://meteor.com/"><img src="https://img.shields.io/badge/meteor-1.4.4.1-blue.svg"/></a>
<a href="https://vuejs.org/"><img src="https://img.shields.io/badge/vue-1.x-green.svg"/> <img src="https://img.shields.io/badge/vue-2.2.6-brightgreen.svg"/></a>
</p>

<br/>

**This project is currently in beta.**

vue+meteor is a set of packages to help you create awesome apps quickly and efficiently with two great web technologies:

- [vuejs](http://vuejs.org/) is the frontend
- [meteor](http://meteor.com/) is the platform (client, server, database, network)

You will be able to [use meteor data inside Vue](https://github.com/Akryum/vue-meteor-tracker#vue-integration-for-meteor) or [write `.vue` files in your meteor project](https://github.com/Akryum/meteor-vue-component/tree/master/packages/vue-component).

### [Complete Example/Demo Project](https://github.com/Akryum/vue-meteor-demo)

## Recommended Packages Links

- [:package: `vue-meteor-tracker`](https://github.com/Akryum/vue-meteor-tracker) (meteor tracker integration)
- [:package: `akryum:vue-component`](https://github.com/Akryum/meteor-vue-component/tree/master/packages/vue-component) (vue component files)
- [:package: `akryum:vue-router2`](https://github.com/Akryum/meteor-vue-component/tree/master/packages/vue-router2) (`vue-router` 2.x helpers)
- [:package: `vue-apollo`](https://github.com/Akryum/vue-apollo) (apollo integration)
- [:package: `akryum:vue-blaze-template`](https://github.com/Akryum/meteor-vue-component/tree/master/packages/vue-blaze-template) (use blaze inside vue components)
- [:package: `vue-supply`](https://github.com/Akryum/vue-supply) (use reactive data & automatic subscriptions in components and vuex store)
- [:package: `akryum:vue-ssr`](https://github.com/Akryum/vue-meteor/tree/master/packages/vue-ssr) (Server-Side Rendering)

## More Examples

For more detailed documentations, see the [usage section](#usage) below.

- [Simple example project (Vue 2.x)](https://github.com/Akryum/meteor-vue2-example)
- [Simple example project (Vue 1.x)](https://github.com/Akryum/meteor-vue-example)
- [Routing example project (vue 2.x)](https://github.com/Akryum/meteor-vue2-example-routing)
- [Routing example project (Vue 1.x)](https://github.com/Akryum/meteor-vue-example-routing)
- [Blaze example project](https://github.com/Akryum/meteor-vue-blaze) [[2](https://github.com/Akryum/meteor-vue-blaze/tree/render-blaze)]
- [i18n example project](https://github.com/Akryum/meteor-vue-example-i18n)

## Usage

### **Recommended**: New project with Vue 2.x and without Blaze ![vue](https://img.shields.io/badge/vue-2.x-brightgreen.svg)

Create a new project without blaze, using Vue 2.x:

See the [simple example project](https://github.com/Akryum/meteor-vue2-example).

### New project with Vue 1.x and without blaze ![vue](https://img.shields.io/badge/vue-1.x-green.svg)

Create a new project without blaze, using Vue 1.x:

See the [simple example project](https://github.com/Akryum/meteor-vue-example).

### New project with blaze ![vue](https://img.shields.io/badge/vue-1.x-green.svg)

See the [blaze example project](https://github.com/Akryum/meteor-vue-blaze).

### Meteor & Tracker data integration ![vue](https://img.shields.io/badge/vue-1.x-green.svg) ![vue](https://img.shields.io/badge/vue-2.x-brightgreen.svg)

Declarative subscriptions and meteor reactive data

[:package: See Usage in npm vue-meteor-tracker package](https://github.com/Akryum/vue-meteor-tracker#vue-integration-for-meteor)

### Single-file component ![vue](https://img.shields.io/badge/vue-1.x-green.svg) ![vue](https://img.shields.io/badge/vue-2.x-brightgreen.svg)

It allows you to write your components in [this format](https://vuejs.org/guide/application.html#Single-File-Components) with hot-reloading support.

[:package: See Usage in arkyum:vue-component package](https://github.com/Akryum/meteor-vue-component/tree/master/packages/vue-component#usage)

### Routing

#### ![vue](https://img.shields.io/badge/vue-1.x-green.svg)

Routing for Vue 1.x and Meteor using [vue-router](https://github.com/vuejs/vue-router).

[:package: See Installation & Usage in arkyum:vue-router package](https://github.com/Akryum/meteor-vue-component/tree/master/packages/vue-router#installation)

[Example app](https://github.com/Akryum/meteor-vue-example-routing)

#### ![vue](https://img.shields.io/badge/vue-2.x-brightgreen.svg)

Routing for Vue 2.x and Meteor using [vue-router](https://github.com/vuejs/vue-router).

[:package: See Installation & Usage in arkyum:vue-router2 package](https://github.com/Akryum/meteor-vue-component/tree/master/packages/vue-router2#installation)

[Example app](https://github.com/Akryum/meteor-vue2-example-routing)

### Apollo integration ![vue](https://img.shields.io/badge/vue-1.x-green.svg) ![vue](https://img.shields.io/badge/vue-2.x-brightgreen.svg)

Use apollo in your vue component!

[:package: See Installation & Usage in the vue-apollo npm package](https://github.com/Akryum/vue-apollo)

### Localization ![vue](https://img.shields.io/badge/vue-1.x-green.svg)

Translate your app quickly and easily with [vue-i18n](https://github.com/kazupon/vue-i18n).

[:package: See Installation & Usage in akryum:vue-i18n package](https://github.com/Akryum/meteor-vue-component/tree/master/packages/vue-i18n#installation)

[:package: Premade selection ui in akryum:vue-i18n-ui package](https://github.com/Akryum/meteor-vue-component/tree/master/packages/vue-i18n-ui)

[Example app](https://github.com/Akryum/meteor-vue-example-i18n)

### Embed Blaze template ![vue](https://img.shields.io/badge/vue-1.x-green.svg) ![vue](https://img.shields.io/badge/vue-2.x-brightgreen.svg)

Use Blaze templates inside your vue components.

[:package: See Installation & Usage in akryum:vue-blaze-template](https://github.com/Akryum/meteor-vue-component/tree/master/packages/vue-blaze-template)

[Example app](https://github.com/Akryum/meteor-vue-blaze/tree/render-blaze)

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
 - [x] Typescript support in .vue files
 - [x] Server-side rendering (Vue 2.x)
 - [ ] *`src` attribute support in `.vue` files*
 - [ ] Apollo Server-side rendering (Vue 2.x)

Track the project progress [here](https://github.com/Akryum/meteor-vue-component/milestones).

## Get involved

This project is very much a work-in-progress, so your help will be greatly appreciated!  
Feel free to contribute by opening a PR or an issue (but check before if the topic already exists).

### Development project

Clone this repository and type in the project directory:

    meteor npm install
    meteor

---

LICENCE ISC - Created by Guillaume CHAU (@Akryum)
