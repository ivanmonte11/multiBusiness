-- CreateTable
CREATE TABLE "public"."refunds" (
    "id" TEXT NOT NULL,
    "refundNumber" TEXT NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "saleId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "refunds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."refund_items" (
    "id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(65,30) NOT NULL,
    "subtotal" DECIMAL(65,30) NOT NULL,
    "refundId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "refund_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "refunds_refundNumber_key" ON "public"."refunds"("refundNumber");

-- AddForeignKey
ALTER TABLE "public"."refunds" ADD CONSTRAINT "refunds_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "public"."sales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."refunds" ADD CONSTRAINT "refunds_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."refund_items" ADD CONSTRAINT "refund_items_refundId_fkey" FOREIGN KEY ("refundId") REFERENCES "public"."refunds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."refund_items" ADD CONSTRAINT "refund_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
