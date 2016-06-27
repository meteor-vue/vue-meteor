import ApolloClient from 'apollo-client';
import { meteorClientConfig } from 'meteor/apollo';

import gql from 'graphql-tag';
window['gql'] = gql;

export const client = new ApolloClient(meteorClientConfig({
  path: process.env.APOLLO_CLIENT_URL || '/graphql'
}));
