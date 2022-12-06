import { createAsyncThunk } from "@reduxjs/toolkit";
import { httpService, Storage } from "../../lib/utilities";
import { AddressModel, ProductModel } from "../../types/model";
import { RootStoreState } from "../store";

export const fetchAddresses = createAsyncThunk('user/fetchAddress', async (args, { getState }) => {
  const { user: { user } } = getState() as RootStoreState;
  let addresses: AddressModel[] = [];

  await httpService('/api/login/login', {
    data: {
      act: 'ShipList',
      dt: JSON.stringify({ regid: user?.id }),
    }
  }).then(({ status, data }) => {
    if (200 === status) {
      addresses = data;
    }
  }).catch((err) => void(0))

  return addresses;
});

export const fetchFavorites = createAsyncThunk('user/fetchFavorites', async (args, { getState }) => {
  const { user: { user } } = getState() as RootStoreState;
  let favorites: ProductModel[] = [];

  await httpService('/api/product/product', {
    data: {
      act: 'FavoritList',
      dt: JSON.stringify({ regid: user?.id })
    }
  }).then(({ status, data }) => {
    if (200 === status) {
      favorites = data;
    }
  }).catch((err) => void(0))

  return favorites;
});

export const setFavorites = createAsyncThunk('shop/setFavorites', async (items: ProductModel[]) => {
  return items;
});

export const toggleFavorite = createAsyncThunk('shop/toggleFavorite', async (product: ProductModel, { getState }) => {
  const { user: { user, favorites, location } } = getState() as RootStoreState;
  let oldFavorites: ProductModel[] = [...favorites];
  let shouldPush = false;

  const productExist = oldFavorites.find((item) => item.prd_id === product.prd_id);
  // console.log('DATA PRODUK__ '+productExist);
  await httpService('/api/product/product', {
    data: {
      act: 'Favorit',
      dt: JSON.stringify({
        prdid: product.prd_id,
        regid: user?.id,
        cmd: '1',
        star: !productExist ? '1' : '0',
        remark: '',
        lat: location.lat,
        lng: location.lng,
        ip: location.ip,
      }),
    }
  }).then(({ status, data }) => {
    if (200 === status && !productExist) {
      shouldPush = true;
    }
  }).catch(() => void(0));

  const newFavorites: ProductModel[] = oldFavorites.filter((item) => {
    return item.prd_id !== product.prd_id;
  });

  if (shouldPush) {
    newFavorites.push({
      ...product,
      prd_favorit: '1',
    });
  }

  return newFavorites;
});
