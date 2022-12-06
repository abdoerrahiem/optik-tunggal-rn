import { AddressModel, Modelable, ProductModel, UserModel } from "../model";

export type UserRootState = {
  user: UserModel;
  notifications: any[];
  firebase: UserFirebase;
  location: UserLocation;
  address: Modelable<AddressModel>;
  favorites: ProductModel[];
};

export type UserLocation = {
  lat?: number | null;
  lng?: number | null;
  address?: string | null;
  ip?: string;
};

export type UserFirebase = {
  token?: string;
  [key: string]: any;
};
