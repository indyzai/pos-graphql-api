import { gql } from 'graphql-tag';

const billingTypeDefs = gql`
  type BillItem {
    id: ID!
    product: Product!
    quantity: Int!
    price: Float!
  }

  type Bill {
    id: ID!
    createdAt: String!
    cashier: PosUser
    cashierId: Int
    storeId: Int!
    store: Store!
    items: [BillItem!]!
    total: Float!
    discount: Float!
    tax: Float!
  }

  extend type Query {
    bills: [Bill!]! # admin: all, cashier: own
    bill(id: ID!): Bill
  }

  extend type Mutation {
    createBill(items: [BillItemInput!]!, discount: Float, tax: Float): Bill!
    deleteBill(id: ID!): Boolean! # admin only
  }

  input BillItemInput {
    productId: ID!
    quantity: Int!
    price: Float!
  }
`;

export default billingTypeDefs; 