import { mergeTypeDefs, mergeResolvers } from '@graphql-tools/merge';
import { rootTypeDefs } from './rootSchema';
import billingTypeDefs from '../modules/billing/billing.schema';
import billingResolvers from '../modules/billing/billing.resolver';
import userTypeDefs from '../modules/user/user.schema';
import userResolvers from '../modules/user/user.resolver';
import productTypeDefs from '../modules/product/product.schema';
import productResolvers from '../modules/product/product.resolver';
import inventoryTypeDefs from '../modules/inventory/inventory.schema';
import inventoryResolvers from '../modules/inventory/inventory.resolver';
import storeTypeDefs from '../modules/store/store.schema';
import storeResolvers from '../modules/store/store.resolver';
import auditTypeDefs from '../modules/audit/audit.schema';
import auditResolvers from '../modules/audit/audit.resolver';
// import other domain schemas and resolvers as you split them out

export const typeDefs = mergeTypeDefs([
  rootTypeDefs,
  billingTypeDefs,
  userTypeDefs,
  productTypeDefs,
  inventoryTypeDefs,
  storeTypeDefs,
  auditTypeDefs,
  // other domain typeDefs
]);

export const resolvers = mergeResolvers([
  billingResolvers,
  userResolvers,
  productResolvers,
  inventoryResolvers,
  storeResolvers,
  auditResolvers,
  // other domain resolvers
]);