import { verifyJwt } from '../modules/user/user.auth';
import { Request } from 'express';

export async function context({ req }: { req: Request }) {
  const auth = req.headers.authorization || '';
  const token = auth.replace('Bearer ', '');
  const user = token ? verifyJwt(token) : null;
  return { user, storeId: user?.storeId, organizationId: user?.organizationId };
} 