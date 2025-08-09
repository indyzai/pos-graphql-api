import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function requireAuth(context: any) {
  if (!context.user) throw new Error('Authentication required');
}

function requireAdmin(context: any) {
  requireAuth(context);
  if (context.user.role !== 'admin') throw new Error('Admin privileges required');
}

const auditResolvers = {
  Query: {
    auditLogs: async (_parent: any, args: any, context: any) => {
      requireAdmin(context);
      const { limit = 50, offset = 0 } = args;
      return prisma.posAuditLog.findMany({
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        include: { user: true },
      });
    },
    auditLog: async (_parent: any, args: any, context: any) => {
      requireAdmin(context);
      return prisma.posAuditLog.findUnique({
        where: { id: Number(args.id) },
        include: { user: true },
      });
    },
  },
  PosAuditLog: {
    user: (parent: any) => parent.userId ? prisma.posUser.findUnique({ where: { id: parent.userId } }) : null,
  },
};

export default auditResolvers;
