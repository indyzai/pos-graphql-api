import { gql } from 'graphql-tag';

const productTypeDefs = /* GraphQL */ `
  type Product {
    id: ID!
    name: String!
    barcode: String!
    price: Float!
    stock: Int! # legacy field
    stockInPieces: Int!
    stockInWeight: Float!
    storeId: Int!
    store: Store!
    billItems: [BillItem!]!
    purchaseItems: [PurchaseItem!]!
    stockItems: [StockItem!]!
    createdAt: String!
    updatedAt: String!
  }

  extend type Query {
    products: [Product!]!
    product(id: ID!): Product
  }

  extend type Mutation {
    createProduct(name: String!, barcode: String!, price: Float!, stock: Int, stockInPieces: Int, stockInWeight: Float): Product!
    updateProduct(id: ID!, name: String, barcode: String, price: Float, stock: Int, stockInPieces: Int, stockInWeight: Float): Product!
    deleteProduct(id: ID!): Boolean!
  }
`;

export default productTypeDefs;