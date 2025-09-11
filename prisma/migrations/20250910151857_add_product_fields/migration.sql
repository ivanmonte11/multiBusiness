-- AlterTable
ALTER TABLE "public"."products" ADD COLUMN     "cost" DECIMAL(65,30),
ADD COLUMN     "dimensions" TEXT,
ADD COLUMN     "image" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lowStockThreshold" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "weight" DECIMAL(65,30);
