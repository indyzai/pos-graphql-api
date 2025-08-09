// Minimal Supabase Edge Function for GraphQL using Yoga (Deno runtime)
// This is a placeholder schema. Replace resolvers/typeDefs with real app logic once Deno-compatible.

import { createYoga, createSchema } from "npm:graphql-yoga@5";
import { yoga } from '../../../src/graphql/server';

// const yoga = createYoga({
//   schema: createSchema({
//     typeDefs: /* GraphQL */ `
//       type Query {
//         hello: String!
//       }
//     `,
//     resolvers: {
//       Query: {
//         hello: () => "Hello from Supabase Edge Function!",
//       },
//     },
//   }),
//   graphqlEndpoint: "/",
// });

Deno.serve(yoga.fetch);