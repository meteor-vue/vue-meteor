export default {
  '/': {
    name: 'home',
    component: '/imports/ui/Home.vue'
  },
  '/forum': {
    name: 'forum',
    component: '/imports/ui/Forum.vue'
  },
  '/apollo': {
    name: 'apollo',
    component: '/imports/ui/Apollo.vue'
  },
  '/vuex': {
    name: 'vuex',
    component: '/imports/ui/vuex/VuexDemo.vue',
    subRoutes: {
      '/': {
        component: '/imports/ui/vuex/Counter.vue'
      },
      '/tracker': {
        name: 'vuex.tracker',
        component: '/imports/ui/vuex/Tracker.vue'
      }
    }
  }
};
