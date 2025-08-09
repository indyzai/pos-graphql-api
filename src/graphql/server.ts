import express from 'express';
import dotenv from 'dotenv';
import { createYoga, createSchema } from 'graphql-yoga';
import { typeDefs, resolvers } from './schema';
import { verifyJwt } from '../modules/user/user.auth';

dotenv.config();

export async function createServer() {
  const app = express();

  // Health check route
  app.get('/health', (_req, res) => res.send('OK'));

  const schema = createSchema({ typeDefs, resolvers });

  const yoga = createYoga({
    schema,
    graphqlEndpoint: '/graphql',
    context: async ({ request }) => {
      const auth = request.headers.get('authorization') || '';
      const token = auth.replace('Bearer ', '');
      const user = token ? verifyJwt(token) : null;
      return { user, storeId: user?.storeId, organizationId: user?.organizationId };
    },
  });

  app.use(yoga.graphqlEndpoint, yoga);

  return app;
}