import { CartModel, CategoryModel, BrandModel, GenderModel, ColorModel, BrandCLModel } from "../model";

export type ShopRootState = {
  cart_items?: CartModel[];
  categories?: CategoryModel[];
  brands?: BrandModel[];
  clbrands?: BrandCLModel[];
  warnas?: ColorModel[];
  // genders?: GenderModel[];
};
