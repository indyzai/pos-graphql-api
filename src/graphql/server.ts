import express from 'express';
import dotenv from 'dotenv';
import { createYoga } from 'graphql-yoga';
import { verifyJwt } from '../modules/user/user.auth';
import { createGraphQLSchema } from './gateway';

dotenv.config();

export async function createServer() {
  const app = express();

  // Health check route
  app.get('/health', (_req, res) => res.send('OK'));

  const schema = await createGraphQLSchema();

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