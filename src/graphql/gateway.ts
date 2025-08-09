import { buildSchema, parse, GraphQLSchema } from 'graphql';
import { stitchSchemas } from '@graphql-tools/stitch';
import { buildHTTPExecutor } from '@graphql-tools/executor-http';
import { stitchingDirectives, federationToStitchingSDL } from '@graphql-tools/stitching-directives';
import { createSchema } from 'graphql-yoga';
import { typeDefs, resolvers } from './schema';

export type FederatedServiceConfig = {
  endpoint: string;
  headers?: Record<string, string>;
};

async function buildRemoteSubschema(config: FederatedServiceConfig, stitchingSDLTransformer: typeof federationToStitchingSDL) {
  const executor = buildHTTPExecutor({ endpoint: config.endpoint, headers: config.headers });

  const result: any = await executor({
    document: parse(/* GraphQL */ `
      query GetFederationSDL { _service { sdl } }
    `),
  });

  if (!result?.data?._service?.sdl) {
    throw new Error(`Failed to fetch federation SDL from ${config.endpoint}`);
  }

  const stitchingSDL = stitchingSDLTransformer(result.data._service.sdl);
  const schema = buildSchema(stitchingSDL);
  return { schema, executor };
}

/**
 * Create a GraphQLSchema. If FEDERATED_SERVICES env var is defined, it stitches
 * the local schema with remote federated subgraphs using stitching directives.
 * FEDERATED_SERVICES should be a comma-separated list of URLs.
 */
export async function createGraphQLSchema(): Promise<GraphQLSchema> {
  const { stitchingDirectivesTransformer } = stitchingDirectives();

  const localSchema = createSchema({
    typeDefs: [typeDefs],
    resolvers,
  });

  const servicesEnv = process.env.FEDERATED_SERVICES;
  if (!servicesEnv) {
    return localSchema;
  }

  const serviceEndpoints = servicesEnv
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((endpoint) => ({ endpoint }));

  const remoteSubschemas = await Promise.all(
    serviceEndpoints.map((svc) => buildRemoteSubschema(svc, (sdl) => federationToStitchingSDL(sdl, stitchingDirectives())))
  );

  const stitched = stitchSchemas({
    subschemaConfigTransforms: [stitchingDirectivesTransformer],
    subschemas: [
      ...remoteSubschemas,
      { schema: localSchema },
    ],
  });

  return stitched;
}