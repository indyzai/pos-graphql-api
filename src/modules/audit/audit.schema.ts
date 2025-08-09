import { gql } from 'graphql-tag';

const auditTypeDefs = gql`
  type PosAuditLog {
    id: ID!
    user: PosUser
    userId: Int
    action: String!
    details: String
    createdAt: String!
  }

  extend type Query {
    auditLogs(limit: Int, offset: Int): [PosAuditLog!]! # admin only
    auditLog(id: ID!): PosAuditLog # admin only
  }
`;

export default auditTypeDefs;
