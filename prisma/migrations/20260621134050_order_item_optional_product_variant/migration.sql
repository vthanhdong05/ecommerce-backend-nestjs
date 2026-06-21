/*
  Warnings:

  - You are about to drop the column `isDefault` on the `ProductVariant` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."OrderItem" DROP CONSTRAINT "OrderItem_productVariantID_fkey";

-- AlterTable
ALTER TABLE "public"."OrderItem" ADD COLUMN     "productID" TEXT,
ALTER COLUMN "productVariantID" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."ProductVariant" DROP COLUMN "isDefault";

-- AddForeignKey
ALTER TABLE "public"."OrderItem" ADD CONSTRAINT "OrderItem_productVariantID_fkey" FOREIGN KEY ("productVariantID") REFERENCES "public"."ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
