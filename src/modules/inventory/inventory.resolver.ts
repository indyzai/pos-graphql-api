import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function requireAdmin(context: any) {
  if (!context.user) throw new Error('Authentication required');
  if (context.user.role !== 'admin') throw new Error('Admin privileges required');
}

const inventoryResolvers = {
  Query: {
    purchaseBills: async (_parent: any, _args: any, context: any) => {
      requireAdmin(context);
      return prisma.purchaseBill.findMany({ where: { storeId: context.storeId }, include: { items: true } });
    },
    purchaseBill: async (_parent: any, args: any, context: any) => {
      requireAdmin(context);
      return prisma.purchaseBill.findUnique({ where: { id: args.id, storeId: context.storeId }, include: { items: { include: { stockItems: true } } } });
    },
    purchaseItems: async (_parent: any, args: any, context: any) => {
      requireAdmin(context);
      return prisma.purchaseItem.findMany({ where: { purchaseBillId: args.billId }, include: { stockItems: true } });
    },
    stockItems: async (_parent: any, args: any, context: any) => {
      requireAdmin(context);
      return prisma.stockItem.findMany({ where: { purchaseItemId: args.purchaseItemId } });
    },
  },
  Mutation: {
    createPurchaseBill: async (_parent: any, args: any, context: any) => {
      requireAdmin(context);
      const { supplier, items } = args;
      // Calculate total
      let total = 0;
      for (const item of items) {
        total += item.totalPrice;
      }
      // Create bill and items
      const bill = await prisma.purchaseBill.create({
        data: {
          storeId: context.storeId,
          supplier,
          total,
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              unit: item.unit,
              costPrice: item.costPrice,
              sellingPrice: item.sellingPrice,
              totalPrice: item.totalPrice,
              allowPartialSplit: item.allowPartialSplit ?? false,
            })),
          },
        },
        include: { items: true },
      });
      return bill;
    },
    splitPurchaseItem: async (_parent: any, args: any, context: any) => {
      requireAdmin(context);
      const { purchaseItemId, stockItems } = args;
      // Create stock items for the purchase item
      const created = await Promise.all(stockItems.map((si: any) =>
        prisma.stockItem.create({
          data: {
            purchaseItemId,
            productId: si.productId,
            pieceNumber: si.pieceNumber,
            weight: si.weight,
          },
        })
      ));
      return created;
    },
    processPurchaseBill: async (_parent: any, args: any, context: any) => {
      requireAdmin(context);
      const { billId } = args;
      // Fetch bill and items
      const bill = await prisma.purchaseBill.findUnique({
        where: { id: billId, storeId: context.storeId },
        include: { items: { include: { stockItems: true, product: true } } },
      });
      if (!bill) throw new Error('Purchase bill not found');
      if (bill.processed) throw new Error('Bill already processed');
      // Update product stock based on stock items
      for (const item of bill.items) {
        let pieces = 0;
        let weight = 0;
        for (const si of item.stockItems) {
          pieces += 1;
          if (si.weight) weight += si.weight;
        }
        await prisma.product.update({
          where: { id: item.productId, storeId: context.storeId },
          data: {
            stockInPieces: { increment: pieces },
            stockInWeight: { increment: weight },
          },
        });
      }
      // Mark bill as processed
      const updatedBill = await prisma.purchaseBill.update({
        where: { id: billId },
        data: { processed: true },
        include: { items: { include: { stockItems: true } } },
      });
      return updatedBill;
    },
  },
  PurchaseBill: {
    store: (parent: any) => prisma.store.findUnique({ where: { id: parent.storeId } }),
    items: (parent: any) => prisma.purchaseItem.findMany({ where: { purchaseBillId: parent.id } }),
  },
  PurchaseItem: {
    purchaseBill: (parent: any) => prisma.purchaseBill.findUnique({ where: { id: parent.purchaseBillId } }),
    product: (parent: any) => prisma.product.findUnique({ where: { id: parent.productId } }),
    stockItems: (parent: any) => prisma.stockItem.findMany({ where: { purchaseItemId: parent.id } }),
  },
  StockItem: {
    purchaseItem: (parent: any) => prisma.purchaseItem.findUnique({ where: { id: parent.purchaseItemId } }),
    product: (parent: any) => prisma.product.findUnique({ where: { id: parent.productId } }),
  },
};

export default inventoryResolvers;