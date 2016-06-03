# Vue integration for Meteor

**This project is experimental.**

This project contains new meteor packages to help build [meteor](http://meteor.com/) apps with first-class [vuejs](http://vuejs.org/) integration as the ui layer.

## Features

Currently supported and possible future features are:

 - [x] Declarative subscriptions and meteor rective data
 - [x] Single-file components (.vue) with basic support of `<template>`, `<script>` and `<style>` (with optionnal `scoped` attribute)
 - [x] Less integration in .vue files
 - [ ] Apollo client integration (soon)
 - [ ] *Sass integration in .vue files*
 - [ ] *Auto register components with file name ending with .global.vue*
 - [ ] *Easy routing with vue-router out-of-the-box integration*
 - [ ] *Easy translation with vue i18n out-of-the-box integration*
 - [ ] *Jade integration in .vue file*
 - [ ] *Easy state manangement with vueex integration (needs discussion, suggestions welcomed)*
 - [ ] *Hot-reloading of components*

## Usage

### New Meteor project

Open a terminal and type:

    meteor create my-app
    cd ./my-app
    meteor remove blaze-html-templates
    meteor add static-html akryum:vue akryum:vue-component
    meteor

### Example project

In the project directory:

    meteor npm install
    meteor


### Meteor data integration

(See akryum:vue package)[https://github.com/Akryum/meteor-vue-component/tree/master/packages/vue#usage]

The complete example is in the `imports/ui/App.vue` file.

### Single-file component

It allows you to write your components in [this format](https://vuejs.org/guide/application.html#Single-File-Components):
![screenshot](http://blog.evanyou.me/images/vue-component.png)

(See arkyum:vue-component package)[https://github.com/Akryum/meteor-vue-component/tree/master/packages/vue-component#usage]

## Get involved

This project is very much a work-in-progress, so your help will be greatly appreciated!  
Feel free to contribute by opening a PR or an issue (but check before if the topic already exists).

---

LICENCE ISC - Created by Guillaume CHAU (@Akryum)
