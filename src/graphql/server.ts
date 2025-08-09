import { createServer } from 'http';
import { createYoga } from 'graphql-yoga';
import { stitchingDirectivesValidator } from './rootSchema';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { verifyJwt } from '../modules/user/user.auth';
import { typeDefs, resolvers } from './schema';

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

export const yoga = createYoga({
  schema: stitchingDirectivesValidator(schema),
  context: async ({ request }) => {
    const auth = request.headers.get('authorization') || '';
    const token = auth.replace('Bearer ', '');
    const user = token ? verifyJwt(token) : null;
    return { user, organizationId: user?.organizationId };
  },
  graphiql: process.env.NODE_ENV !== 'production',
  landingPage: process.env.NODE_ENV !== 'production',
})

export const gqlServer = createServer(yoga);
