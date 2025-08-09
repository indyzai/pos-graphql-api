import { gql } from 'graphql-tag';

const userTypeDefs = gql`
  type PosUser {
    id: ID!
    userId: Int! # references User from external service
    role: String!
    isActive: Boolean!
    storeId: Int
    store: Store
    organizationId: Int # references Organization from external service
    addressId: Int # references Address from external service
    bills: [Bill!]!
    auditLogs: [PosAuditLog!]!
    createdAt: String!
  }

  type AuthPayload {
    token: String!
    user: PosUser!
  }

  extend type Query {
    me: PosUser
    users: [PosUser!]! # admin only
    user(id: ID!): PosUser # admin only
  }

  extend type Mutation {
    createUser(
      userId: Int!
      role: String!
      storeId: Int!
      organizationId: Int
      addressId: Int
    ): PosUser! # admin only
    updateUser(
      id: ID!
      role: String
      isActive: Boolean
      organizationId: Int
      addressId: Int
    ): PosUser! # admin only
    deleteUser(id: ID!): Boolean! # admin only
  }
`;

export default userTypeDefs;