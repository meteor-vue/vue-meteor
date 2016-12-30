import { createApolloServer } from 'meteor/apollo';
import { makeExecutableSchema } from 'graphql-tools';

import typeDefs from './schema';
import resolvers from './resolvers';

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

createApolloServer({
  graphiql: true,
  pretty: true,
  schema,
  resolvers,
});
