import { createAsyncThunk } from '@reduxjs/toolkit'
import { httpService, Storage } from '../../lib/utilities'
import {
  CartModel,
  CategoryModel,
  BrandModel,
  ColorModel,
  GenderModel,
  ModelKacamata,
  BrandCLModel,
} from '../../types/model'
import { RootStoreState } from '../store'

export const fetchCategories = createAsyncThunk(
  'shop/fetchCategories',
  async () => {
    let categories: CategoryModel[] = []

    await httpService('/api/category', {
      data: {
        act: 'PrdGenderList',
        dt: JSON.stringify({ comp: '001' }),
      },
    }).then(({ status, data }) => {
      if (status === 200) {
        categories = data
      }
    })

    return categories
  }
)

export const fetchGender = createAsyncThunk('shop/fetchGender', async () => {
  let genders: GenderModel[] = []

  await httpService('/api/category', {
    data: {
      act: 'PrdGenderList',
      dt: JSON.stringify({ comp: '001' }),
    },
  }).then(({ status, data }) => {
    if (status === 200) {
      genders = data
    }
  })

  return genders
})

export const fetchModelKacamata = createAsyncThunk(
  'shop/fetchModelKacamata',
  async () => {
    let modelkacamatas: ModelKacamata[] = []

    await httpService('/api/category', {
      data: {
        act: 'PrdModelKacamataList',
        dt: JSON.stringify({ comp: '001' }),
      },
    }).then(({ status, data }) => {
      if (status === 200) {
        modelkacamatas = data
      }
    })

    return modelkacamatas
  }
)

export const fetchBrand = createAsyncThunk('shop/fetchBrand', async () => {
  let brands: BrandModel[] = []

  await httpService('/api/brand/brand', {
    data: {
      act: 'BrandList',
    },
  }).then(({ status, data }) => {
    if (status === 200) {
      brands = data
    }
  })

  return brands
})

export const fetchBrandHome = createAsyncThunk(
  'shop/fetchBrandHome',
  async () => {
    let brands: BrandModel[] = []

    await httpService('/api/brand/brand', {
      data: {
        act: 'BrandListHome',
      },
    }).then(({ status, data }) => {
      if (status === 200) {
        brands = data
      }
    })

    return brands
  }
)

export const fetchBrandClearCL = createAsyncThunk(
  'shop/fetchBrandClearCL',
  async () => {
    let clbrands: BrandCLModel[] = []

    await httpService('/api/brand/brand', {
      data: {
        act: 'BrandClearCL',
      },
    }).then(({ status, data }) => {
      if (status === 200) {
        clbrands = data
      }
    })

    return clbrands
  }
)

export const fetchBrandColorCL = createAsyncThunk(
  'shop/fetchBrandColorCL',
  async () => {
    let clbrands: BrandCLModel[] = []

    await httpService('/api/brand/brand', {
      data: {
        act: 'BrandColorCL',
      },
    }).then(({ status, data }) => {
      if (status === 200) {
        clbrands = data
      }
    })

    return clbrands
  }
)

export const fetchWarna = createAsyncThunk('shop/fetchWarna', async () => {
  let warnas: ColorModel[] = []

  await httpService('/api/brand/brand', {
    data: {
      act: 'BrandList',
    },
  }).then(({ status, data }) => {
    if (status === 200) {
      warnas = data
    }
  })

  return warnas
})

export const setCartItems = createAsyncThunk(
  'shop/setCartItems',
  async (items: CartModel[]) => {
    await Storage.storeData('cart_items', items)

    return items
  }
)

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
  async (items: CartModel[], { getState }) => {
    const {
      shop,
      user: { user },
    } = getState() as RootStoreState
    const { cart_items = [] } = shop

    let shouldPush = true
    items[0].harga = 0

    let useCartItems: CartModel[] = [...cart_items]

    let sameQtyTemp: number = 0 // temporary qty

    for (let index = 0; index < items.length; index++) {
      console.log('diff value', items[index].diff)

      if (items[index].diff === false) {
        console.log('false state')
        // push data with same value
        // and make once assign
        sameQtyTemp += items[index].qty || 0

        // get prev data
        const prevData = useCartItems.filter(
          filterItem =>
            filterItem.prd_id === items[index].product?.prd_id &&
            filterItem.atributColor === items[index].atributColor &&
            filterItem.atributBcurve === items[index].atributBcurve &&
            filterItem.atributSpheries === items[index].atributSpheries
        )
        console.log('prev data avaiable', prevData.length)
        // if prev data is exists
        // we didn't push to cart
        if (prevData.length > 0) {
          useCartItems = useCartItems.map(mapItem => {
            if (
              mapItem.prd_id === items[index].product?.prd_id &&
              mapItem.atributColor === items[index].atributColor &&
              mapItem.atributBcurve === items[index].atributBcurve &&
              mapItem.atributSpheries === items[index].atributSpheries
            ) {
              var newItem = { ...mapItem }
              newItem.qty = (newItem.qty || 0) + (items[index].qty || 0)

              return newItem
            }

            return mapItem
          })
        } else {
          // if the prev data not exist
          // the do push to cart
          useCartItems = [
            ...useCartItems,
            {
              ...items[index],
              ...(!items[index].product?.prd_id
                ? null
                : { prd_id: items[index].product?.prd_id }),
              // qty: sameQtyTemp,
            },
          ]
        }
      } else if (items[index].diff === true) {
        console.log('true state')

        // get prev data
        const prevData = useCartItems.filter(
          filterItem =>
            filterItem.prd_id === items[index].product?.prd_id &&
            filterItem.atributColor === items[index].atributColor &&
            filterItem.atributBcurve === items[index].atributBcurve &&
            filterItem.atributSpheries === items[index].atributSpheries
        )
        console.log('prev data avaiable', prevData.length)
        // if prev data is exists
        // we didn't push to cart
        if (prevData.length > 0) {
          // solving here
          useCartItems = useCartItems.map(mapItem => {
            if (mapItem.prd_id === items[index].product?.prd_id) {
              var newItem = { ...mapItem }

              if (
                mapItem.atributColor === items[index].atributColor &&
                mapItem.atributBcurve === items[index].atributBcurve &&
                mapItem.atributSpheries === items[index].atributSpheries
              ) {
                newItem.qty = (newItem.qty || 0) + (items[index].qty || 0)
                console.log('the qty', items[index].qty)
              }

              return newItem
            }

            console.log('default item', mapItem)

            return mapItem
          })
          // end of solving target
        } else {
          // push to cart when no prev data exist
          useCartItems = [
            ...useCartItems,
            {
              ...items[index],
              ...(!items[index].product?.prd_id
                ? null
                : { prd_id: items[index].product?.prd_id }),
              qty: items[index].qty,
            },
          ]
        }
      } else {
        // push data to cart
        console.log('undefined state')

        // get accessories status
        const isAccessories =
          items[index].atributColor3 !== undefined &&
          items[index].atributColor3 !== ''

        console.log(items[index].atributColor3)
        let prevData: CartModel[] = []

        if (isAccessories) {
          console.log('is accessories')
          // get prev data
          prevData = useCartItems.filter(
            filterItem =>
              filterItem.prd_id === items[index].product?.prd_id &&
              filterItem.atributColor3 === items[index].atributColor3 &&
              filterItem.atributSpheries3 === items[index].atributSpheries3
          )
        } else {
          // get prev data
          prevData = useCartItems.filter(
            filterItem => filterItem.prd_id === items[index].product?.prd_id
          )
        }
        console.log('prev data avaiable', prevData.length)

        // if prev data is exists
        // we didn't push to cart
        if (prevData.length > 0) {
          useCartItems = useCartItems.map(mapItem => {
            if (mapItem.prd_id === items[index].product?.prd_id) {
              var newItem = { ...mapItem }

              // if accessories
              // then check if have same validated data
              // and then update the qty
              if (isAccessories) {
                console.log('acc detected')
                if (
                  mapItem.atributColor3 === items[index].atributColor3 &&
                  mapItem.atributSpheries3 === items[index].atributSpheries3
                ) {
                  newItem.qty = (newItem.qty || 0) + (items[index].qty || 0)
                }
              } else {
                console.log('not accessories qty')
                newItem.qty = (newItem.qty || 0) + (items[index].qty || 0)
              }

              return newItem
            }

            return mapItem
          })
        } else {
          useCartItems = [
            ...useCartItems,
            {
              ...items[index],
              ...(!items[index].product?.prd_id
                ? null
                : { prd_id: items[index].product?.prd_id }),
              hargapaket: items[index].product?.harga,
              qty: items[index].qty,
            },
          ]
        }
      }
    }

    await Storage.storeData('cart_items', useCartItems)

    console.log('lagi', useCartItems)

    return useCartItems
  }
)
