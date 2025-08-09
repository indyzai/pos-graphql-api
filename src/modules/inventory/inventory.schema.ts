import { gql } from 'graphql-tag';

const inventoryTypeDefs = /* GraphQL */ `
  type PurchaseBill {
    id: ID!
    storeId: Int!
    store: Store!
    supplier: String!
    total: Float!
    processed: Boolean!
    createdAt: String!
    items: [PurchaseItem!]!
  }

  type PurchaseItem {
    id: ID!
    purchaseBill: PurchaseBill!
    purchaseBillId: Int!
    product: Product!
    productId: Int!
    quantity: Float!
    unit: String!
    costPrice: Float!
    sellingPrice: Float!
    totalPrice: Float!
    allowPartialSplit: Boolean!
    stockItems: [StockItem!]!
  }

  type StockItem {
    id: ID!
    purchaseItem: PurchaseItem!
    purchaseItemId: Int!
    product: Product!
    productId: Int!
    pieceNumber: Int!
    weight: Float
    createdAt: String!
    sold: Boolean!
  }

  extend type Query {
    purchaseBills: [PurchaseBill!]!
    purchaseBill(id: Int!): PurchaseBill
    purchaseItems(billId: Int!): [PurchaseItem!]!
    stockItems(purchaseItemId: Int!): [StockItem!]!
  }

  extend type Mutation {
    createPurchaseBill(supplier: String!, items: [PurchaseItemInput!]!): PurchaseBill!
    splitPurchaseItem(purchaseItemId: Int!, stockItems: [StockItemInput!]!): [StockItem!]!
    processPurchaseBill(billId: Int!): PurchaseBill!
  }

  input PurchaseItemInput {
    productId: Int!
    quantity: Float!
    unit: String!
    costPrice: Float!
    sellingPrice: Float!
    totalPrice: Float!
    allowPartialSplit: Boolean
  }

  input StockItemInput {
    purchaseItemId: Int!
    productId: Int!
    pieceNumber: Int!
    weight: Float
  }
`;

export default inventoryTypeDefs;