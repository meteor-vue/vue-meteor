import { createApolloServer } from 'meteor/apollo';

import schema from './schema';
import resolvers from './resolvers';

createApolloServer({
  graphiql: true,
  pretty: true,
  schema,
  resolvers,
});
