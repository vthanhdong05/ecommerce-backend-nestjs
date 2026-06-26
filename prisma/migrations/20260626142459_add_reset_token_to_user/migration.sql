/*
  Warnings:

  - The values [free_shipping] on the enum `PromotionType` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `scope` to the `Promotion` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."PromotionScope" AS ENUM ('ORDER', 'SHIPPING');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."PromotionType_new" AS ENUM ('percentage', 'fixed_amount', 'buy_x_get_y');
ALTER TABLE "public"."Promotion" ALTER COLUMN "type" TYPE "public"."PromotionType_new" USING ("type"::text::"public"."PromotionType_new");
ALTER TYPE "public"."PromotionType" RENAME TO "PromotionType_old";
ALTER TYPE "public"."PromotionType_new" RENAME TO "PromotionType";
DROP TYPE "public"."PromotionType_old";
COMMIT;

-- AlterTable
ALTER TABLE "public"."Promotion" ADD COLUMN     "scope" "public"."PromotionScope" NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "resetToken" TEXT;
