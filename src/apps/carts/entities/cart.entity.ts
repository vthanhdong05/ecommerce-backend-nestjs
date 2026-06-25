import { Cart as CartPrisma } from '@prisma/client';

export class Cart implements CartPrisma {
  id!: string;
  userID!: string;
  createdAt!: Date;
  updatedAt!: Date;
}
