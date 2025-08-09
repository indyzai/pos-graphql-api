// Apollo Server v4 and @apollo/client integration test setup will be added here.
// TODO: Implement Apollo Server v4 test client using @apollo/client and supertest or http.

import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
import express from 'express';
import { typeDefs } from '../graphql/typeDefs';
import { resolvers } from '../graphql/resolvers';
import { createHttpLink, ApolloClient, InMemoryCache, gql } from '@apollo/client/core';
import fetch from 'cross-fetch';
import http from 'http';
import { jest } from '@jest/globals';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
let server: http.Server;
let url: string;

beforeAll(async () => {
  // Ensure store and product exist
  await prisma.organization.create({
    data: {
      id: 1,
      name: 'Test Org',
      stores: {
        create: [{ id: 1, name: 'Test Store', createdAt: new Date() }],
      },
      createdAt: new Date(),
    },
  });
  await prisma.product.create({
    data: {
      id: 1,
      name: 'Test Product',
      barcode: '123',
      price: 100,
      stock: 0,
      stockInPieces: 0,
      stockInWeight: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      storeId: 1,
    },
  });

  const app = express();
  const apolloServer = new ApolloServer({ typeDefs, resolvers });
  await apolloServer.start();
  app.use(
    '/graphql',
    express.json(),
    expressMiddleware(apolloServer, {
      context: async () => ({
        user: { id: 1, email: 'admin@example.com', role: 'admin', storeId: 1, organizationId: 1 },
        storeId: 1,
        organizationId: 1,
      }),
    })
  );
  server = app.listen(0);
  const address = server.address();
  if (typeof address === 'string' || address === null) throw new Error('Invalid address');
  url = `http://127.0.0.1:${address.port}/graphql`;
});

afterAll(async () => {
  if (server) server.close();
  // Clean up test data
  await prisma.stockItem.deleteMany();
  await prisma.purchaseItem.deleteMany();
  await prisma.purchaseBill.deleteMany();
  await prisma.product.deleteMany();
  await prisma.store.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.$disconnect();
});

describe('Purchase Bill Flow', () => {
  it('creates and queries purchase bills/items/stock', async () => {
    const client = new ApolloClient({
      link: createHttpLink({ uri: url, fetch }),
      cache: new InMemoryCache(),
    });

    // 1. Create a purchase bill
    const CREATE_BILL = gql`
      mutation CreatePurchaseBill($supplier: String!, $items: [PurchaseItemInput!]!) {
        createPurchaseBill(supplier: $supplier, items: $items) {
          id
          supplier
          items { id productId }
        }
      }
    `;
    const createBillRes = await client.mutate({
      mutation: CREATE_BILL,
      variables: {
        supplier: 'Test Supplier',
        items: [
          { productId: 1, quantity: 5, unit: 'kg', costPrice: 100, sellingPrice: 120, totalPrice: 500, allowPartialSplit: true },
        ],
      },
    });
    expect(createBillRes.data.createPurchaseBill.supplier).toBe('Test Supplier');
    const billId = createBillRes.data.createPurchaseBill.id;
    const purchaseItemId = createBillRes.data.createPurchaseBill.items[0].id;

    // 2. Query purchase bills
    const PURCHASE_BILLS = gql`
      query {
        purchaseBills {
          id
          supplier
          items { id }
        }
      }
    `;
    const billsRes = await client.query({ query: PURCHASE_BILLS });
    expect(billsRes.data.purchaseBills.length).toBeGreaterThan(0);
  });
}); 