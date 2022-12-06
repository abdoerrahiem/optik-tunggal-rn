import {createSlice, PayloadAction, SliceCaseReducers} from '@reduxjs/toolkit';
import {BrandModel, CartModel, CategoryModel} from '../../types/model';
import {ShopRootState} from '../../types/redux/ShopReducer';
import {
  fetchBrand,
  fetchCategories,
  fetchModelKacamata,
  pushCartItem,
  setCartItems,
} from '../actions/shopActions';

export const shopSlice = createSlice<
  ShopRootState,
  SliceCaseReducers<ShopRootState>,
  'shop'
>({
  name: 'shop',
  initialState: {
    cart_items: [],
    categories: [],
    brands: [],
    // genders: [],
  },
  reducers: {
    setCartItems: (state, action: PayloadAction<CartModel[]>) => {
      console.log('setted');
      return {
        ...state,
        cart_items: action.payload,
      };
    },
    setCategories: (state, action: PayloadAction<CategoryModel[]>) => {
      return {
        ...state,
        categories: action.payload,
      };
    },
    // setGenders: (state, action: PayloadAction<GenderModel[]>) => {
    //   return {
    //     ...state,
    //     genders: action.payload,
    //   };
    // },
    setBrand: (state, action: PayloadAction<BrandModel[]>) => {
      return {
        ...state,
        brands: action.payload,
      };
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchCategories.fulfilled, (state, action) => {
        return {
          ...state,
          categories: action.payload,
        };
      })
      // .addCase(fetchGender.fulfilled, (state, action) => {
      //   return {
      //     ...state,
      //     genders: action.payload,
      //   };
      // })
      .addCase(fetchModelKacamata.fulfilled, (state, action) => {
        return {
          ...state,
          modelkacamata: action.payload,
        };
      })
      .addCase(fetchBrand.fulfilled, (state, action) => {
        return {
          ...state,
          brands: action.payload,
        };
      })
      .addCase(setCartItems.fulfilled, (state, action) => {
        return {
          ...state,
          cart_items: action.payload,
        };
      })
      .addCase(pushCartItem.fulfilled, (state, action) => {
        return {
          ...state,
          cart_items: action.payload,
        };
      });
  },
});

// Action creators are generated for each case reducer function
export const {
  setCartItems: setShopCartItems,
  setCategories: setShopCategories,
  setBrand: setShopBrand,
  // setGenders: setShopGenders,
} = shopSlice.actions;

export default shopSlice.reducer;
