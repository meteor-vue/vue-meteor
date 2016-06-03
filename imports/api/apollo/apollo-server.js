import { apolloServer } from 'graphql-tools';
import express from 'express';
import { Meteor } from 'meteor/meteor';
import { WebApp } from 'meteor/webapp';

import schema from './schema';
import resolvers from './resolvers';

const graphQLServer = express();

graphQLServer.use('/graphql', apolloServer((req) => {
    return new Promise((resolve) => {
        let user = null;

        // Get the token from the header
        if (req.headers.authorization) {
            const token = req.headers.authorization;
            check(token, String);
            const hashedToken = Accounts._hashLoginToken(token);

            // Get the user from the database
            user = Meteor.users.findOne({ "services.resume.loginTokens.hashedToken": hashedToken });
        }

        resolve({
            graphiql: true,
            pretty: true,
            schema,
            resolvers,

            // Attach the user to the context object
            context: {
                // The current user will now be available on context.user in all resolvers
                user,
            },
        });
    });
}));

// This redirects all requests to /graphql to our Express GraphQL server
WebApp.rawConnectHandlers.use(Meteor.bindEnvironment(graphQLServer));
