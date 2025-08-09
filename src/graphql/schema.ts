import { mergeTypeDefs, mergeResolvers } from '@graphql-tools/merge';
import { rootTypeDefs } from './rootSchema';
import billingTypeDefs from '../modules/billing/billing.schema';
import billingResolvers from '../modules/billing/billing.resolver';
import organizationTypeDefs from '../modules/organization/organization.schema';
import organizationResolvers from '../modules/organization/organization.resolver';
import userTypeDefs from '../modules/user/user.schema';
import userResolvers from '../modules/user/user.resolver';
import productTypeDefs from '../modules/product/product.schema';
import productResolvers from '../modules/product/product.resolver';
import inventoryTypeDefs from '../modules/inventory/inventory.schema';
import inventoryResolvers from '../modules/inventory/inventory.resolver';
// import other domain schemas and resolvers as you split them out

export const typeDefs = mergeTypeDefs([
  rootTypeDefs,
  billingTypeDefs,
  organizationTypeDefs,
  userTypeDefs,
  productTypeDefs,
  inventoryTypeDefs,
  // other domain typeDefs
]);

export const resolvers = mergeResolvers([
  billingResolvers,
  organizationResolvers,
  userResolvers,
  productResolvers,
  inventoryResolvers,
  // other domain resolvers
]);