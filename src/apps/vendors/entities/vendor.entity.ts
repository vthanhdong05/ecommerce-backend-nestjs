import { $Enums, Vendor as VendorPrisma } from '@prisma/client';

export class Vendor implements VendorPrisma {
  name!: string;
  id!: string;
  userID!: string;
  slug!: string;
  description!: string | null;
  logoUrl!: string | null;
  taxCode!: string | null;
  totalProducts!: number;
  totalOrders!: number;
  status!: $Enums.VendorStatus;
  createdAt!: Date;
  createdBy!: string | null;
  updatedAt!: Date;
  deletedAt!: Date | null;
}
