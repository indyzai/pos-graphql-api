import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function requireAuth(context: any) {
  if (!context.user) throw new Error('Authentication required');
}

function requireAdmin(context: any) {
  requireAuth(context);
  if (context.user.role !== 'admin') throw new Error('Admin privileges required');
}

const productResolvers = {
  Query: {
    products: async (_parent: any, _args: any, context: any) => {
      requireAuth(context);
      return prisma.product.findMany({ where: { storeId: context.storeId } });
    },
    product: async (_parent: any, args: any, context: any) => {
      requireAuth(context);
      return prisma.product.findUnique({ where: { id: Number(args.id), storeId: context.storeId } });
    },
  },
  Mutation: {
    createProduct: async (_parent: any, args: any, context: any) => {
      requireAdmin(context);
      const { name, barcode, price, stock = 0, stockInPieces = 0, stockInWeight = 0 } = args;
      const product = await prisma.product.create({
        data: { name, barcode, price, stock, stockInPieces, stockInWeight, storeId: context.storeId },
      });
      // Audit log for product creation
      await prisma.posAuditLog.create({
        data: {
          userId: context.user.id,
          action: 'CREATE_PRODUCT',
          details: `Product ID: ${product.id}, Name: ${product.name}`,
        },
      });
      return product;
    },
    updateProduct: async (_parent: any, args: any, context: any) => {
      requireAdmin(context);
      const { id, ...data } = args;
      const product = await prisma.product.update({
        where: { id: Number(id), storeId: context.storeId },
        data,
      });
      // Audit log for product update
      await prisma.posAuditLog.create({
        data: {
          userId: context.user.id,
          action: 'UPDATE_PRODUCT',
          details: `Product ID: ${product.id}, Name: ${product.name}`,
        },
      });
      return product;
    },
    deleteProduct: async (_parent: any, args: any, context: any) => {
      requireAdmin(context);
      const productId = Number(args.id);
      const product = await prisma.product.findUnique({ where: { id: productId, storeId: context.storeId } });
      await prisma.product.delete({ where: { id: productId, storeId: context.storeId } });
      // Audit log for product deletion
      await prisma.posAuditLog.create({
        data: {
          userId: context.user.id,
          action: 'DELETE_PRODUCT',
          details: `Product ID: ${productId}${product ? `, Name: ${product.name}` : ''}`,
        },
      });
      return true;
    },
  },
  Product: {
    store: (parent: any) => prisma.store.findUnique({ where: { id: parent.storeId } }),
    billItems: (parent: any) => prisma.billItem.findMany({ where: { productId: parent.id } }),
    purchaseItems: (parent: any) => prisma.purchaseItem.findMany({ where: { productId: parent.id } }),
    stockItems: (parent: any) => prisma.stockItem.findMany({ where: { productId: parent.id } }),
  },
};

export default productResolvers;