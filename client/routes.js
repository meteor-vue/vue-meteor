import {Router} from 'meteor/akryum:vue-router';

// Components
import Home from '/imports/ui/Home.vue';
import Forum from '/imports/ui/Forum.vue';
import Apollo from '/imports/ui/Apollo.vue';

Router.map({
  '/': {
    name: 'home',
    component: Home
  },
  '/forum': {
    name: 'forum',
    component: Forum
  },
  '/apollo': {
    name: 'apollo',
    component: Apollo
  }
});
