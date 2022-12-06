import {createAsyncThunk} from '@reduxjs/toolkit';
import {httpService, Storage} from '../../lib/utilities';
import {
  CartModel,
  CategoryModel,
  BrandModel,
  ColorModel,
  GenderModel,
  ModelKacamata,
  BrandCLModel,
} from '../../types/model';
import {RootStoreState} from '../store';

export const fetchCategories = createAsyncThunk(
  'shop/fetchCategories',
  async () => {
    let categories: CategoryModel[] = [];

    await httpService('/api/category', {
      data: {
        act: 'PrdGenderList',
        dt: JSON.stringify({comp: '001'}),
      },
    }).then(({status, data}) => {
      if (status === 200) {
        categories = data;
      }
    });

    return categories;
  },
);

export const fetchGender = createAsyncThunk('shop/fetchGender', async () => {
  let genders: GenderModel[] = [];

  await httpService('/api/category', {
    data: {
      act: 'PrdGenderList',
      dt: JSON.stringify({comp: '001'}),
    },
  }).then(({status, data}) => {
    if (status === 200) {
      genders = data;
    }
  });

  return genders;
});

export const fetchModelKacamata = createAsyncThunk(
  'shop/fetchModelKacamata',
  async () => {
    let modelkacamatas: ModelKacamata[] = [];

    await httpService('/api/category', {
      data: {
        act: 'PrdModelKacamataList',
        dt: JSON.stringify({comp: '001'}),
      },
    }).then(({status, data}) => {
      if (status === 200) {
        modelkacamatas = data;
      }
    });

    return modelkacamatas;
  },
);

export const fetchBrand = createAsyncThunk('shop/fetchBrand', async () => {
  let brands: BrandModel[] = [];

  await httpService('/api/brand/brand', {
    data: {
      act: 'BrandList',
    },
  }).then(({status, data}) => {
    if (status === 200) {
      brands = data;
    }
  });

  return brands;
});

export const fetchBrandHome = createAsyncThunk(
  'shop/fetchBrandHome',
  async () => {
    let brands: BrandModel[] = [];

    await httpService('/api/brand/brand', {
      data: {
        act: 'BrandListHome',
      },
    }).then(({status, data}) => {
      if (status === 200) {
        brands = data;
      }
    });

    return brands;
  },
);

export const fetchBrandClearCL = createAsyncThunk(
  'shop/fetchBrandClearCL',
  async () => {
    let clbrands: BrandCLModel[] = [];

    await httpService('/api/brand/brand', {
      data: {
        act: 'BrandClearCL',
      },
    }).then(({status, data}) => {
      if (status === 200) {
        clbrands = data;
      }
    });

    return clbrands;
  },
);

export const fetchBrandColorCL = createAsyncThunk(
  'shop/fetchBrandColorCL',
  async () => {
    let clbrands: BrandCLModel[] = [];

    await httpService('/api/brand/brand', {
      data: {
        act: 'BrandColorCL',
      },
    }).then(({status, data}) => {
      if (status === 200) {
        clbrands = data;
      }
    });

    return clbrands;
  },
);

export const fetchWarna = createAsyncThunk('shop/fetchWarna', async () => {
  let warnas: ColorModel[] = [];

  await httpService('/api/brand/brand', {
    data: {
      act: 'BrandList',
    },
  }).then(({status, data}) => {
    if (status === 200) {
      warnas = data;
    }
  });

  return warnas;
});

export const setCartItems = createAsyncThunk(
  'shop/setCartItems',
  async (items: CartModel[]) => {
    await Storage.storeData('cart_items', items);

    return items;
  },
);

// export const pushCartItem = createAsyncThunk('shop/pushCartItem', async (items: CartModel[], { getState }) => {
//   const { shop, user: { user } } = getState() as RootStoreState;
//   const { cart_items = [] } = shop;

//   // let shouldPush = true;

//   const newItems: CartModel[] = [];
//   let newCartItems: CartModel[] = items;

//   if (cart_items.length) {
//     newCartItems = cart_items.map((cartItem) => {
//       items.forEach(item => {
//         const { product } = item;
//         if (cartItem.prd_id === product?.prd_id && item.type === cartItem.type) {
//           const newItem = { ...cartItem };

//           newItem.qty = (newItem.qty || 0) + 1;
//           // shouldPush = false;
//           newItems.push(newItem)
//         } else {
//           newItems.push(item);
//         }
//       })

//       return cartItem;
//     })
//   }

//   newCartItems.concat(newItems)
//   console.log({ newCartItems });
//   // if (shouldPush) {
//     // newCartItems.push({
//     //   ...item,
//     //   ...(!product?.prd_id ? null : { prd_id: product?.prd_id }),
//     //   // qty: 1,
//     // });
//   // }

//   await Storage.storeData('cart_items', newCartItems);

//   return newCartItems;
// });

export const pushCartItem = createAsyncThunk(
  'shop/pushCartItem',
  async (item: CartModel, {getState}) => {
    const {
      shop,
      user: {user},
    } = getState() as RootStoreState;
    const {cart_items = []} = shop;
    const {product} = item;

    let shouldPush = true;
    item.harga = 0;

    // switch (item.type) {
    //   case 'reseller':
    //     item.harga = product?.harga_reseller;
    //     break;
    //   case 'retail':
    //     item.harga = product?.harga_retail;
    //     break;
    //   case 'refill':
    //     item.harga = product?.harga_refill;
    //     break;
    // }

    const newCartItems: CartModel[] = [...cart_items].map(cartItem => {
      if (cartItem.prd_id === product?.prd_id && item.type === cartItem.type) {
        const newItem = {...cartItem};

        newItem.qty = (newItem.qty || 0) + 1;
        shouldPush = false;

        return newItem;
      }

      return cartItem;
    });

    if (shouldPush) {
      newCartItems.push({
        ...item,
        ...(!product?.prd_id ? null : {prd_id: product?.prd_id}),
        qty: 1,
      });
    }

    await Storage.storeData('cart_items', newCartItems);

    return newCartItems;
  },
);
