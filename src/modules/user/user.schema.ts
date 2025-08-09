
const userTypeDefs = /* GraphQL */ `
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


  extend type Query {
    posMe: PosUser
    posUsers: [PosUser!]! # admin only
    posUser(id: ID!): PosUser # admin only
  }

  extend type Mutation {
    createPosUser(
      userId: Int!
      role: String!
      storeId: Int!
      organizationId: Int
      addressId: Int
    ): PosUser! # admin only
    updatePosUser(
      id: ID!
      role: String
      isActive: Boolean
      organizationId: Int
      addressId: Int
    ): PosUser! # admin only
    deletePosUser(id: ID!): Boolean! # admin only
  }
`;

export default userTypeDefs;