/*
  Warnings:

  - You are about to drop the column `userId` on the `AuthKey` table. All the data in the column will be lost.
  - You are about to drop the `Address` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Organization` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserAuditLog` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `posUserId` to the `AuthKey` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "indyz_pos"."PosUser" DROP CONSTRAINT "PosUser_userId_fkey";

-- DropForeignKey
ALTER TABLE "indyz_pos"."Store" DROP CONSTRAINT "Store_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "indyz_pos"."User" DROP CONSTRAINT "User_storeId_fkey";

-- DropForeignKey
ALTER TABLE "indyz_pos"."UserAuditLog" DROP CONSTRAINT "UserAuditLog_userId_fkey";

-- DropIndex
DROP INDEX "indyz_pos"."PosUser_userId_key";

-- AlterTable
ALTER TABLE "indyz_pos"."AuthKey" DROP COLUMN "userId",
ADD COLUMN     "posUserId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "indyz_pos"."Address";

-- DropTable
DROP TABLE "indyz_pos"."Organization";

-- DropTable
DROP TABLE "indyz_pos"."User";

-- DropTable
DROP TABLE "indyz_pos"."UserAuditLog";

-- AddForeignKey
ALTER TABLE "indyz_pos"."AuthKey" ADD CONSTRAINT "AuthKey_posUserId_fkey" FOREIGN KEY ("posUserId") REFERENCES "indyz_pos"."PosUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
