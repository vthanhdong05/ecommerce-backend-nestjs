import { $Enums, OrderAddress as OrderAddressPrisma } from '@prisma/client';

export class OrderAddress implements OrderAddressPrisma {
  id!: string;
  orderID!: string;
  type!: $Enums.AddressType;
  firstName!: string;
  lastName!: string | null;
  company!: string | null;
  fullAddress!: string;
  city!: string | null;
  province!: string | null;
  country!: string | null;
  phone!: string;
}
