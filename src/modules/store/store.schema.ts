
const storeTypeDefs = /* GraphQL */ `
  type Store {
    id: ID!
    name: String!
    organizationId: Int! # references Organization from external service
    addressId: Int # references Address from external service
    posUsers: [PosUser!]!
    products: [Product!]!
    bills: [Bill!]!
    purchaseBills: [PurchaseBill!]!
    createdAt: String!
  }

  extend type Query {
    stores: [Store!]! # admin only
    store(id: ID!): Store # admin only
  }

  extend type Mutation {
    createStore(
      name: String!
      organizationId: Int!
      addressId: Int
    ): Store! # admin only
    updateStore(
      id: ID!
      name: String
      organizationId: Int
      addressId: Int
    ): Store! # admin only
    deleteStore(id: ID!): Boolean! # admin only
  }
`;

export default storeTypeDefs;
