import { Prisma } from '@prisma/client';

class ExportProductImagesDto {
  ids!: NonNullable<Prisma.ProductImageWhereUniqueInput['id']>[];
}

export { ExportProductImagesDto };
