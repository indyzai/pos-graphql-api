import { prisma } from '../../db/client';

function requireAuth(context: any) {
  if (!context.user) throw new Error('Authentication required');
}

function requireAdmin(context: any) {
  requireAuth(context);
  if (context.user.role !== 'admin') throw new Error('Admin privileges required');
}

const userResolvers = {
  Query: {
    me: async (_parent: any, _args: any, context: any) => {
      if (!context.user) return null;
      return prisma.posUser.findUnique({ where: { id: context.user.id, storeId: context.storeId } });
    },
    users: async (_parent: any, _args: any, context: any) => {
      requireAdmin(context);
      return prisma.posUser.findMany({ where: { storeId: context.storeId } });
    },
    user: async (_parent: any, args: any, context: any) => {
      requireAdmin(context);
      return prisma.posUser.findUnique({ where: { id: Number(args.id), storeId: context.storeId } });
    },
  },
  Mutation: {
    createUser: async (_parent: any, args: any, context: any) => {
      requireAdmin(context);
      const { userId, role, storeId, organizationId, addressId } = args;
      
      // Check if store exists
      const store = await prisma.store.findUnique({ where: { id: storeId } });
      if (!store) throw new Error('Store not found');
      
      // Check if user already exists for this external userId
      const existing = await prisma.posUser.findFirst({ where: { userId } });
      if (existing) throw new Error('PosUser already exists for this userId');
      
      const user = await prisma.posUser.create({
        data: {
          userId,
          role,
          storeId,
          organizationId,
          addressId,
        },
      });
      
      // Audit log for user creation
      await prisma.posAuditLog.create({
        data: {
          userId: user.id,
          action: 'CREATE_USER',
          details: `Admin created PosUser for external userId ${userId}`,
        },
      });
      return user;
    },
    updateUser: async (_parent: any, args: any, context: any) => {
      requireAdmin(context);
      const { id, ...data } = args;
      if (data.password) delete data.password; // Don't allow password update here
      return prisma.posUser.update({
        where: { id: Number(id) },
        data,
      });
    },
    deleteUser: async (_parent: any, args: any, context: any) => {
      requireAdmin(context);
      await prisma.posUser.delete({ where: { id: Number(args.id) } });
      return true;
    },

  },
  PosUser: {
    store: (parent: any) => parent.storeId ? prisma.store.findUnique({ where: { id: parent.storeId } }) : null,
    bills: (parent: any) => prisma.bill.findMany({ where: { cashierId: parent.id } }),
    auditLogs: (parent: any) => prisma.posAuditLog.findMany({ where: { userId: parent.id } }),
  },
};

export default userResolvers;