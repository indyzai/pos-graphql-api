import { gql } from 'graphql-tag';
import { stitchingDirectives } from '@graphql-tools/stitching-directives';

const { stitchingDirectivesTypeDefs, stitchingDirectivesValidator } = stitchingDirectives();

const baseTypeDefs = gql`
  type Query {
    _empty: String
    _sdl: String!
  }

  type Mutation {
    _empty: String
  }

  type _Service {
    sdl: String!
  }

  extend type Query {
    _service: _Service!
  }
`;

export const rootTypeDefs = [stitchingDirectivesTypeDefs, baseTypeDefs];
export { stitchingDirectivesValidator };