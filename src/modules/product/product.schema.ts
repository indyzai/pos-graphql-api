import { gql } from 'graphql-tag';

const productTypeDefs = gql`
  type Product {
    id: ID!
    name: String!
    barcode: String!
    price: Float!
    stock: Int!
    createdAt: String!
    updatedAt: String!
  }

  extend type Query {
    products: [Product!]!
    product(id: ID!): Product
  }

  extend type Mutation {
    createProduct(name: String!, barcode: String!, price: Float!, stock: Int!): Product!
    updateProduct(id: ID!, name: String, barcode: String, price: Float, stock: Int): Product!
    deleteProduct(id: ID!): Boolean!
  }
`;

export default productTypeDefs;