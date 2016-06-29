export const name = 'vue-apollo';

import {Vue} from 'meteor/akryum:vue';
import Plugin from './plugin';

Vue.use(Plugin);

import { client } from './client';

export const ApolloClient = client;
