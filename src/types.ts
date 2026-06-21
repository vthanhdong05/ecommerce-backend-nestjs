declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace PrismaJson {
    type ProductVariantSnapshotType = {
      productVariantID: string;
      productID: string;
      productName: string;
      variantName: string | null;
      sku: string | null;
      price: string;
      attributes: Record<string, unknown> | null;
    };
  }
}

// This file must be a module.
export {};
