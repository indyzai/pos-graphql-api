-- CreateTable
CREATE TABLE "indyz_pos"."Store" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "addressId" INTEGER,
    "organizationId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "indyz_pos"."PosUser" (
    "id" SERIAL NOT NULL,
    "role" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "storeId" INTEGER,
    "addressId" INTEGER,
    "organizationId" INTEGER,

    CONSTRAINT "PosUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "indyz_pos"."Product" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "barcode" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "stock" INTEGER NOT NULL,
    "stockInPieces" INTEGER NOT NULL DEFAULT 0,
    "stockInWeight" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "storeId" INTEGER NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "indyz_pos"."Bill" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cashierId" INTEGER,
    "total" DOUBLE PRECISION NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL,
    "tax" DOUBLE PRECISION NOT NULL,
    "storeId" INTEGER NOT NULL,

    CONSTRAINT "Bill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "indyz_pos"."BillItem" (
    "id" SERIAL NOT NULL,
    "billId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "BillItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "indyz_pos"."PosAuditLog" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PosAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "indyz_pos"."PurchaseBill" (
    "id" SERIAL NOT NULL,
    "storeId" INTEGER NOT NULL,
    "supplier" TEXT NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PurchaseBill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "indyz_pos"."PurchaseItem" (
    "id" SERIAL NOT NULL,
    "purchaseBillId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "costPrice" DOUBLE PRECISION NOT NULL,
    "sellingPrice" DOUBLE PRECISION NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "allowPartialSplit" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PurchaseItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "indyz_pos"."StockItem" (
    "id" SERIAL NOT NULL,
    "purchaseItemId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "pieceNumber" INTEGER NOT NULL,
    "weight" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sold" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "StockItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_barcode_key" ON "indyz_pos"."Product"("barcode");

-- AddForeignKey
ALTER TABLE "indyz_pos"."PosUser" ADD CONSTRAINT "PosUser_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "indyz_pos"."Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "indyz_pos"."Product" ADD CONSTRAINT "Product_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "indyz_pos"."Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "indyz_pos"."Bill" ADD CONSTRAINT "Bill_cashierId_fkey" FOREIGN KEY ("cashierId") REFERENCES "indyz_pos"."PosUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "indyz_pos"."Bill" ADD CONSTRAINT "Bill_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "indyz_pos"."Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "indyz_pos"."BillItem" ADD CONSTRAINT "BillItem_billId_fkey" FOREIGN KEY ("billId") REFERENCES "indyz_pos"."Bill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "indyz_pos"."BillItem" ADD CONSTRAINT "BillItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "indyz_pos"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "indyz_pos"."PosAuditLog" ADD CONSTRAINT "PosAuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "indyz_pos"."PosUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "indyz_pos"."PurchaseBill" ADD CONSTRAINT "PurchaseBill_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "indyz_pos"."Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "indyz_pos"."PurchaseItem" ADD CONSTRAINT "PurchaseItem_purchaseBillId_fkey" FOREIGN KEY ("purchaseBillId") REFERENCES "indyz_pos"."PurchaseBill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "indyz_pos"."PurchaseItem" ADD CONSTRAINT "PurchaseItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "indyz_pos"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "indyz_pos"."StockItem" ADD CONSTRAINT "StockItem_purchaseItemId_fkey" FOREIGN KEY ("purchaseItemId") REFERENCES "indyz_pos"."PurchaseItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "indyz_pos"."StockItem" ADD CONSTRAINT "StockItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "indyz_pos"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
