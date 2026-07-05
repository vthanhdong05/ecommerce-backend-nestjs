-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('pending', 'processing', 'succeeded', 'failed', 'refunded', 'cancelled');

-- CreateEnum
CREATE TYPE "public"."PaymentMethod" AS ENUM ('cod', 'vnpay');

-- AlterTable
ALTER TABLE "public"."Order" ADD COLUMN     "expiredAt" TIMESTAMP(3),
ADD COLUMN     "paymentMethod" "public"."PaymentMethod";

-- CreateTable
CREATE TABLE "public"."Payment" (
    "id" TEXT NOT NULL,
    "orderID" TEXT NOT NULL,
    "method" "public"."PaymentMethod" NOT NULL,
    "status" "public"."PaymentStatus" NOT NULL DEFAULT 'pending',
    "amount" DECIMAL(18,2) NOT NULL,
    "vnpTxnRef" TEXT,
    "vnpTransactionNo" TEXT,
    "vnpBankCode" TEXT,
    "vnpBankTranNo" TEXT,
    "vnpCardType" TEXT,
    "vnpPayDate" TIMESTAMP(3),
    "vnpResponseCode" TEXT,
    "refundAmount" DECIMAL(18,2) DEFAULT 0,
    "refundDate" TIMESTAMP(3),
    "refundReason" TEXT,
    "refundTxnRef" TEXT,
    "refundResponseCode" TEXT,
    "expiredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Payment_vnpTxnRef_key" ON "public"."Payment"("vnpTxnRef");

-- CreateIndex
CREATE INDEX "Payment_orderID_idx" ON "public"."Payment"("orderID");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "public"."Payment"("status");

-- CreateIndex
CREATE INDEX "Payment_vnpTxnRef_idx" ON "public"."Payment"("vnpTxnRef");

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_orderID_fkey" FOREIGN KEY ("orderID") REFERENCES "public"."Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
