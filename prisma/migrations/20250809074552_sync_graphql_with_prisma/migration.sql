/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `PosUser` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `PosUser` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "indyz_pos"."PosUser" ADD COLUMN     "userId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "indyz_pos"."User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "storeId" INTEGER,
    "addressId" INTEGER,
    "organizationId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "indyz_pos"."UserAuditLog" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "indyz_pos"."AuthKey" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuthKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "indyz_pos"."Address" (
    "id" SERIAL NOT NULL,
    "line1" TEXT NOT NULL,
    "line2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "indyz_pos"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AuthKey_key_key" ON "indyz_pos"."AuthKey"("key");

-- CreateIndex
CREATE UNIQUE INDEX "PosUser_userId_key" ON "indyz_pos"."PosUser"("userId");

-- AddForeignKey
ALTER TABLE "indyz_pos"."User" ADD CONSTRAINT "User_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "indyz_pos"."Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "indyz_pos"."PosUser" ADD CONSTRAINT "PosUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "indyz_pos"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "indyz_pos"."UserAuditLog" ADD CONSTRAINT "UserAuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "indyz_pos"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
