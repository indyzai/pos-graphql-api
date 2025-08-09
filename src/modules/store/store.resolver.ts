import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function requireAuth(context: any) {
  if (!context.user) throw new Error('Authentication required');
}

function requireAdmin(context: any) {
  requireAuth(context);
  if (context.user.role !== 'admin') throw new Error('Admin privileges required');
}

const storeResolvers = {
  Query: {
    stores: async (_parent: any, _args: any, context: any) => {
      requireAdmin(context);
      return prisma.store.findMany();
    },
    store: async (_parent: any, args: any, context: any) => {
      requireAdmin(context);
      return prisma.store.findUnique({ 
        where: { id: Number(args.id) }
      });
    },
  },
  Mutation: {
    createStore: async (_parent: any, args: any, context: any) => {
      requireAdmin(context);
      const { name, organizationId, addressId } = args;
      const store = await prisma.store.create({
        data: { name, organizationId, addressId },
      });
      // Audit log for store creation
      await prisma.posAuditLog.create({
        data: {
          userId: context.user.id,
          action: 'CREATE_STORE',
          details: `Store ID: ${store.id}, Name: ${store.name}`,
        },
      });
      return store;
    },
    updateStore: async (_parent: any, args: any, context: any) => {
      requireAdmin(context);
      const { id, ...data } = args;
      const store = await prisma.store.update({
        where: { id: Number(id) },
        data,
      });
      // Audit log for store update
      await prisma.posAuditLog.create({
        data: {
          userId: context.user.id,
          action: 'UPDATE_STORE',
          details: `Store ID: ${store.id}, Name: ${store.name}`,
        },
      });
      return store;
    },
    deleteStore: async (_parent: any, args: any, context: any) => {
      requireAdmin(context);
      const storeId = Number(args.id);
      const store = await prisma.store.findUnique({ 
        where: { id: storeId } 
      });
      await prisma.store.delete({ 
        where: { id: storeId } 
      });
      // Audit log for store deletion
      await prisma.posAuditLog.create({
        data: {
          userId: context.user.id,
          action: 'DELETE_STORE',
          details: `Store ID: ${storeId}${store ? `, Name: ${store.name}` : ''}`,
        },
      });
      return true;
    },
  },
  Store: {
    posUsers: (parent: any) => prisma.posUser.findMany({ where: { storeId: parent.id } }),
    products: (parent: any) => prisma.product.findMany({ where: { storeId: parent.id } }),
    bills: (parent: any) => prisma.bill.findMany({ where: { storeId: parent.id } }),
    purchaseBills: (parent: any) => prisma.purchaseBill.findMany({ where: { storeId: parent.id } }),
  },
};

export default storeResolvers;
