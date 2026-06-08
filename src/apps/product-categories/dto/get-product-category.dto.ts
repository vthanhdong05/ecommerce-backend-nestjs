import { Category } from '../../categories/entities/category.entity';
import { Product } from '../../products/entities/product.entity';

export class ExportProductCategoriesDto {
  productIDs!: Product['id'][];
  categoryIDs!: Category['id'][];
}

export type ProductsData = Pick<Product, 'id' | 'name'>[];
export type ProductsImportCreate = Pick<Product, 'name' | 'vendorID' | 'slug' | 'price'>[];

export type CategoriesData = Pick<Category, 'id' | 'name'>[];
export type CategoriesImportCreate = Pick<Category, 'name' | 'slug'>[];
