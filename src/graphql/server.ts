import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
import dotenv from 'dotenv';
import { typeDefs, resolvers } from './schema';
import { verifyJwt } from '../modules/user/user.auth';

dotenv.config();

export async function createServer() {
  const app = express();

  // Health check route
  app.get('/health', (_req, res) => res.send('OK'));

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });
  await server.start();

  app.use('/graphql',
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        const auth = req.headers.authorization || '';
        const token = auth.replace('Bearer ', '');
        const user = token ? verifyJwt(token) : null;
        return { user, storeId: user?.storeId, organizationId: user?.organizationId };
      },
    })
  );

  return app;
}