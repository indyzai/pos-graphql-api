import { gql } from 'graphql-tag';

const userTypeDefs = gql`
  type User {
    id: ID!
    email: String!
    name: String!
    role: String!
    createdAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Address {
    id: Int!
    line1: String!
    line2: String
    city: String!
    state: String!
    country: String!
    postalCode: String!
    createdAt: String!
  }

  input AddressInput {
    line1: String!
    line2: String
    city: String!
    state: String!
    country: String!
    postalCode: String!
  }

  extend type Query {
    me: User
    users: [User!]! # admin only
    user(id: ID!): User # admin only
  }

  extend type Mutation {
    register(email: String!, password: String!, name: String!, role: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    requestPasswordReset(email: String!): Boolean!
    resetPassword(email: String!, key: String!, newPassword: String!): Boolean!
    createUser(
      email: String!
      password: String!
      name: String!
      role: String!
      storeId: Int!
      address: AddressInput
      addressId: Int
    ): User! # admin only
    updateUser(id: ID!, name: String, role: String): User! # admin only
    deleteUser(id: ID!): Boolean! # admin only
  }
`;

export default userTypeDefs;