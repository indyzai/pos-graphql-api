import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function requireAuth(context: any) {
  if (!context.user) throw new Error('Authentication required');
}

function requireAdmin(context: any) {
  requireAuth(context);
  if (context.user.role !== 'admin') throw new Error('Admin privileges required');
}

const billingResolvers = {
  Query: {
    bills: async (_parent: any, _args: any, context: any) => {
      requireAuth(context);
      if (context.user.role === 'admin') {
        return prisma.bill.findMany({ where: { storeId: context.storeId }, include: { items: { include: { product: true } }, cashier: true } });
      } else {
        return prisma.bill.findMany({ where: { cashierId: context.user.id, storeId: context.storeId }, include: { items: { include: { product: true } }, cashier: true } });
      }
    },
    bill: async (_parent: any, args: any, context: any) => {
      requireAuth(context);
      const bill = await prisma.bill.findUnique({ where: { id: Number(args.id), storeId: context.storeId }, include: { items: { include: { product: true } }, cashier: true } });
      if (!bill) return null;
      if (context.user.role !== 'admin' && bill.cashierId !== context.user.id) throw new Error('Access denied');
      return bill;
    },
  },
  Mutation: {
    createBill: async (_parent: any, args: any, context: any) => {
      requireAuth(context);
      const { items, discount = 0, tax = 0 } = args;
      // Calculate total
      let total = 0;
      for (const item of items) {
        total += item.price * item.quantity;
      }
      total = total - discount + tax;
      // Create bill and items
      const bill = await prisma.bill.create({
        data: {
          cashierId: context.user.id,
          total,
          discount,
          tax,
          storeId: context.storeId,
          items: {
            create: items.map((item: any) => ({
              productId: Number(item.productId),
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: { items: { include: { product: true } }, cashier: true },
      });
      // Audit log for bill creation
      await prisma.posAuditLog.create({
        data: {
          userId: context.user.id,
          action: 'CREATE_BILL',
          details: `Bill ID: ${bill.id}, Total: ${bill.total}`,
        },
      });
      return bill;
    },
    deleteBill: async (_parent: any, args: any, context: any) => {
      requireAdmin(context);
      const billId = Number(args.id);
      // Optionally fetch bill for details before deletion
      const bill = await prisma.bill.findUnique({ where: { id: billId, storeId: context.storeId } });
      await prisma.bill.delete({ where: { id: billId, storeId: context.storeId } });
      // Audit log for bill deletion
      await prisma.posAuditLog.create({
        data: {
          userId: context.user.id,
          action: 'DELETE_BILL',
          details: `Bill ID: ${billId}${bill ? `, Total: ${bill.total}` : ''}`,
        },
      });
      return true;
    },
  },
  Bill: {
    items: (parent: any) => prisma.billItem.findMany({ where: { billId: parent.id }, include: { product: true } }),
    cashier: (parent: any) => parent.cashierId ? prisma.posUser.findUnique({ where: { id: parent.cashierId } }) : null,
  },
  BillItem: {
    product: (parent: any) => prisma.product.findUnique({ where: { id: parent.productId } }),
  },
};

export default billingResolvers; 