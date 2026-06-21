/*
  Warnings:

  - You are about to drop the column `productID` on the `OrderItem` table. All the data in the column will be lost.
  - Made the column `productVariantID` on table `OrderItem` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."OrderItem" DROP CONSTRAINT "OrderItem_productVariantID_fkey";

-- AlterTable
ALTER TABLE "public"."OrderItem" DROP COLUMN "productID",
ALTER COLUMN "productVariantID" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."ProductVariant" ADD COLUMN     "isDefault" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "public"."OrderItem" ADD CONSTRAINT "OrderItem_productVariantID_fkey" FOREIGN KEY ("productVariantID") REFERENCES "public"."ProductVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
