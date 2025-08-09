import { prisma } from '../../db/client';
import { hashPassword, comparePassword, signJwt } from '../../auth/auth.utils';
import { sendEmail, sendSMS, sendWhatsApp } from '../../services/notificationService';

function requireAuth(context: any) {
  if (!context.user) throw new Error('Authentication required');
}

function requireAdmin(context: any) {
  requireAuth(context);
  if (context.user.role !== 'admin') throw new Error('Admin privileges required');
}

async function sendResetKey(user: any, key: string) {
  if (user.email) {
    await sendEmail(user.email, `Your password reset code: ${key}`);
  } else if (user.phone) {
    await sendSMS(user.phone, `Your password reset code: ${key}`);
  } else {
    throw new Error('No contact info for user');
  }
}

const userResolvers = {
  Query: {
    me: async (_parent: any, _args: any, context: any) => {
      if (!context.user) return null;
      return prisma.user.findUnique({ where: { id: context.user.id, storeId: context.storeId } });
    },
    users: async (_parent: any, _args: any, context: any) => {
      requireAdmin(context);
      return prisma.user.findMany({ where: { storeId: context.storeId } });
    },
    user: async (_parent: any, args: any, context: any) => {
      requireAdmin(context);
      return prisma.user.findUnique({ where: { id: Number(args.id), storeId: context.storeId } });
    },
  },
  Mutation: {
    register: async (_parent: any, args: any) => {
      const { email, password, name, role, storeId } = args;
      if (!storeId) throw new Error('storeId is required');
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) throw new Error('Email already registered');
      const hashed = await hashPassword(password);
      const store = await prisma.store.findUnique({ where: { id: storeId } });
      if (!store) throw new Error('Store not found');
      const user = await prisma.user.create({
        data: { email, password: hashed, name, role, storeId },
      });
      if (!user.email) throw new Error('User email is required for JWT');
      if (user.storeId == null) throw new Error('User storeId is required for JWT');
      if (store.organizationId == null) throw new Error('Store organizationId is required for JWT');
      const token = signJwt({
        id: user.id,
        email: user.email,
        role: user.role,
        storeId: user.storeId,
        organizationId: store.organizationId,
      });
      // Audit log for registration
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'REGISTER',
          details: `User ${user.email} registered`,
        },
      });
      return { token, user };
    },
    login: async (_parent: any, args: any) => {
      const { email, password } = args;
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) throw new Error('Invalid credentials');
      const valid = await comparePassword(password, user.password);
      if (!valid) throw new Error('Invalid credentials');
      if (!user.email) throw new Error('User email is required for JWT');
      if (user.storeId == null) throw new Error('User storeId is required for JWT');
      const store = user.storeId ? await prisma.store.findUnique({ where: { id: user.storeId } }) : null;
      if (!store || store.organizationId == null) throw new Error('Store or organizationId not found for JWT');
      const token = signJwt({
        id: user.id,
        email: user.email,
        role: user.role,
        storeId: user.storeId,
        organizationId: store.organizationId,
      });
      // Audit log for successful login
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'LOGIN',
          details: `User ${user.email} logged in`,
        },
      });
      return { token, user };
    },
    createUser: async (_parent: any, { email, password, name, role, storeId, address, addressId }: any, context: any) => {
      requireAdmin(context);
      // Find the store to get the organizationId
      const store = await prisma.store.findUnique({ where: { id: storeId } });
      if (!store) throw new Error('Store not found');
      let addrId = addressId;
      if (addressId) {
        const addr = await prisma.address.findUnique({ where: { id: addressId } });
        if (!addr || addr.organizationId !== store.organizationId) {
          throw new Error('Address does not belong to this organization');
        }
      } else if (address) {
        const addr = await prisma.address.create({ data: { ...address, organizationId: store.organizationId } });
        addrId = addr.id;
      } else {
        throw new Error('Either address or addressId must be provided');
      }
      const user = await prisma.user.create({
        data: {
          email,
          password: await hashPassword(password),
          name,
          role,
          storeId,
          addressId: addrId,
        },
      });
      // Audit log for user creation
      await prisma.auditLog.create({
        data: {
          userId: context.user.id,
          action: 'CREATE_USER',
          details: `Admin ${context.user.email} created user ${email}`,
        },
      });
      return user;
    },
    updateUser: async (_parent: any, args: any, context: any) => {
      requireAdmin(context);
      const { id, ...data } = args;
      if (data.password) delete data.password; // Don't allow password update here
      return prisma.user.update({
        where: { id: Number(id) },
        data,
      });
    },
    deleteUser: async (_parent: any, args: any, context: any) => {
      requireAdmin(context);
      await prisma.user.delete({ where: { id: Number(args.id) } });
      return true;
    },
    requestPasswordReset: async (_: any, { email }: { email: string }) => {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return true; // Do not reveal if user exists
      const key = Math.random().toString(36).substring(2, 15);
      await prisma.authKey.create({ data: { key, type: 'reset', userId: user.id } });
      await sendResetKey(user, key);
      // Audit log for password reset request
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'REQUEST_PASSWORD_RESET',
          details: `Password reset requested for ${user.email}`,
        },
      });
      return true;
    },
    resetPassword: async (_: any, { email, key, newPassword }: { email: string, key: string, newPassword: string }) => {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) throw new Error('Invalid user');
      const authKey = await prisma.authKey.findFirst({ where: { key, userId: user.id, type: 'reset', used: false } });
      if (!authKey) throw new Error('Invalid or expired reset key');
      await prisma.user.update({
        where: { id: user.id },
        data: { password: await hashPassword(newPassword) }
      });
      await prisma.authKey.update({ where: { id: authKey.id }, data: { used: true, usedAt: new Date() } });
      // Audit log for password reset
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'RESET_PASSWORD',
          details: `Password reset for ${user.email}`,
        },
      });
      return true;
    },
  },
};

export default userResolvers;