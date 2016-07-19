import ApolloClient from 'apollo-client';
import { meteorClientConfig } from 'meteor/apollo';
import _ from 'lodash';

// Register gql globally
import gql from 'graphql-tag';
if(window) {
  window['gql'] = gql;
} else if(self) {
  self['gql'] = gql;
}

// Default config
let meteorConfig = {
  path: process.env.APOLLO_CLIENT_URL || '/graphql'
};
let apolloClientOptions = {};

// Instance
let apolloClient = null;

// API
export class VueApollo {
  static setMeteorClientConfig(options) {
    _.merge(meteorConfig, options);
    if(apolloClient) {
      console.warn('Options set after the apollo client has been created will not be applied.');
    }
  }

  static setApolloClientOptions(options) {
    _.merge(apolloClientOptions, options);
    if(apolloClient) {
      console.warn('Options set after the apollo client has been created will not be applied.');
    }
  }

  static createClient() {
    let options = meteorClientConfig(meteorConfig);
    _.merge(options, apolloClientOptions);
    apolloClient = new ApolloClient(options);
    return apolloClient;
  }

  static set client(value) {
    apolloClient = value;
  }

  static get client() {
    if(!apolloClient) {
      VueApollo.createClient();
    }
    return apolloClient;
  }
}
