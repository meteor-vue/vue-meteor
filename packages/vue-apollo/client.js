import ApolloClient, { createNetworkInterface } from 'apollo-client';

import { Accounts } from 'meteor/accounts-base';

import { registerGqlTag } from 'apollo-client/gql';

registerGqlTag();

const networkInterface = createNetworkInterface(process.env.APOLLO_CLIENT_URL || '/graphql');

networkInterface.use([{
  applyMiddleware(request, next) {
    const currentUserToken = Accounts._storedLoginToken();

    if (!currentUserToken) {
      next();
      return;
    }

    if (!request.options.headers) {
      request.options.headers = new Headers();
    }

    request.options.headers.Authorization = currentUserToken;

    next();
  }
}]);

export const client = new ApolloClient({
  networkInterface
});
