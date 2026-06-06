import { Category as CategoryPrisma } from '@prisma/client';

export class Category implements CategoryPrisma {
  name!: string;
  id!: string;
  slug!: string;
  description!: string | null;
  parentID!: string | null;
  imageUrl!: string | null;
  createdAt!: Date;
  createdBy!: string | null;
  updatedAt!: Date;
  deletedAt!: Date | null;
}
