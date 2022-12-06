import { useRoute, RouteProp } from '@react-navigation/core';
import React, { useEffect, useState } from 'react';
import { Alert, Image, RefreshControl, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { colors, wrapper } from '../../../lib/styles';
import { useAppNavigation } from '../../../router/RootNavigation';
import { CartModel, Modelable } from '../../../types/model';
import { Button, PressableBox, TextField, TextFieldNumber, Typography } from '../../../ui-shared/components';
import { BoxLoading } from '../../../ui-shared/loadings';
import Ionicons from 'react-native-vector-icons/Ionicons';
import numeral from 'numeral';
import { useAppSelector } from '../../../redux/hooks';
import { useDispatch } from 'react-redux';
import { setCartItems } from '../../../redux/actions/shopActions';
import { httpService } from '../../../lib/utilities';
import { useTranslation } from 'react-i18next';
import { default as startCase } from 'lodash/startCase';
import {
  formatCurrency,
  getSupportedCurrencies,
} from "react-native-format-currency";

import { PublicHomeStackParamList } from '../../../router/publicBottomTabs';

type OptionsState = {
  cartSelected?: number[];
  notes?: number[];
};

function Cart() {
  // Hooks
  const navigation = useAppNavigation();
  const route = useRoute<RouteProp<PublicHomeStackParamList, 'ProductDetail'>>();
  const { width } = useWindowDimensions();
  const { user: { user }, shop: { cart_items } } = useAppSelector((state) => state);
  const dispatch = useDispatch();
  const { t } = useTranslation('home');

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [cart, setCart] = useState<Modelable<CartModel>>({
    models: [],
    modelsLoaded: false,
  });
  const [options, setOptions] = useState<OptionsState>({
    cartSelected: [],
    notes: [],
  });
  const [price, setPrice] = useState({
    original: 0,
    total: 0,
    totalBuyer: 0,
    orderfirst: 0,
    ordernext: 0,
    isLoaded: false,
  });

  useEffect(() => {
    // console.log('aa',cart_items);
    if (cart.modelsLoaded) {
      handleSelectAll();
    }
    setCart(state => ({
      ...state,
      models: (cart_items || []).filter((item) => !!item.prd_id),
      modelsLoaded: true,
    }));
  }, [cart_items, cart.modelsLoaded]);

  useEffect(() => {
    calculatePrice();
  }, [options.cartSelected, cart.models]);

  const handleSelectAll = () => {
    const { cartSelected = [] } = options;
    const newSelected = cartSelected.length !== cart.models?.length ? (
      cart.models?.map((item, index) => index)
    ) : [];

    console.log('select', newSelected)

    setOptions(state => ({
      ...state,
      cartSelected: newSelected,
    }));
  };

  const handleSelect = (cartItem: CartModel, index?: number) => {
    const { cartSelected = [] } = options;
    const findIndex = index === undefined ? -1 : index;
    const isSelected = cartSelected.indexOf(findIndex) >= 0;

    setOptions(state => ({
      ...state,
      cartSelected: isSelected ? cartSelected.filter((item) => findIndex !== item) : [
        ...cartSelected,
        findIndex
      ],
    }));
  };

  const handleNoteShow = (cartItem: CartModel, index?: number) => {
    const { notes = [] } = options;
    const findIndex = index === undefined ? -1 : index;
    const isSelected = notes.indexOf(findIndex) >= 0;

    setOptions(state => ({
      ...state,
      notes: isSelected ? notes.filter((item) => {
        return cartItem.note ? true : (findIndex !== item);
      }) : [
        ...notes,
        findIndex
      ],
    }));
  };

  const handleQtyChange = (
    change: '+' | '-' | 'remove' | number,
    cartItem: CartModel,
    index?: number,
    alert = true
  ) => {
    const { cartSelected = [] } = options;
    const amount = '+' === change ? 1 : -1;
    const newQty = 'number' === typeof change ? change : (
      'remove' === change ? 0 : (
        (cartItem.qty || 0) + amount
      )
    );
    const findIndex = index === undefined ? -1 : index;
    const isSelected = cartSelected.indexOf(findIndex) >= 0;

    if (newQty <= 0 && alert) {
      return handleCartRemove(cartItem, index);
    }

    const newCartItems = (cart.models || []).map((item, i) => {
      console.log("ini apa : ", item.cartid);
      // if (item.paket > 1 && item.cartid === cartItem.cartid) {
      //   const newItem = { ...item };
      //   newItem.qty = newQty;
      //   return newItem;
      // }
      
      if(item.paket > 1 && item.cartid === cartItem.cartid || i === index){
        const newItem = { ...item };
        newItem.qty = newQty;
        return newItem;
      }

      return item;
    }).filter(({ qty = 0 }) => 'number' === typeof change ? true : qty > 0);

    dispatch(setCartItems(newCartItems));

    // Select item if amount +
    if (newQty <= 0 && isSelected) {
      setOptions(state => ({
        ...state,
        cartSelected: cartSelected.filter((item) => item !== index),
      }));
    } else if (!isSelected) {
      setOptions(state => ({
        ...state,
        cartSelected: [...cartSelected, findIndex],
      }));
    }
  };

  const handleCartRemove = (cartItem: CartModel, index?: number) => {
    Alert.alert(
      `${t('Keranjang')}`,
      `${t('Apakah Anda ingin menghapus produk ini dari keranjang?')}`,
      [
        {
          text: `${t('Batal')}`,
        },
        {
          text: `${t('Hapus')}`,
          onPress: () => handleQtyChange('remove', cartItem, index, false),
        }
      ]
    );
  };

  const handleCheckout = () => {
    console.log('keranjang', cart_items);
    const { models = [] } = cart;
    const { cartSelected = [] } = options;

    // if (!cartSelected.length) {
    //   return Alert.alert(
    //     `${t('Pilih Produk.')}`,
    //     `${t('Pilih dan checklist produk untuk melanjutkan.')}`,
    //   );
    // }

    if (!user) {
      return navigation.navigatePath('Public', {
        screen: 'BottomTabs.AccountStack.Account',
        params: [null, null, { action: 'cart' }]
      });
    }

    navigation.navigatePath('Public', {
      screen: 'Checkout',
      params: [{
        cart_items: cart_items
        // cart_items: models.filter((item, index) => {
        //   return cartSelected.indexOf(index) >= 0;
        // }),
      }],
    });
  };

  const calculatePrice = () => {
    const { cartSelected = [] } = options;

    let original = 0;
    let total = 0;
    let totalBuyer = 0;

    cart.models?.forEach(({ qty = 1, ...item }, index) => {
      if (cartSelected.indexOf(index) >= 0) {
        const { product: itemProduct } = item;
        const discount = user?.buyer === '1' ? 0 : itemProduct?.diskon;
        const subtotalOriginal = ((item.product?.harga || 0) * 100 / (100 - parseFloat(discount || '0'))) * qty;
        const subtotal = (item.product?.harga || 0) * qty;

        original += subtotalOriginal;
        total += subtotal;

        // if ('reseller' === item.type) {
        //   totalReseller += subtotal;
        // }
      }
    });

    setPrice(state => ({
      ...state,
      original,
      total,
      totalBuyer,
    }));
  };

  const isCartSelected = (cartItem: CartModel, index?: number): boolean => {
    const { cartSelected = [] } = options;

    return cartSelected.indexOf(undefined === index ? -1 : index) >= 0;
  };

  const isCartNoted = (cartItem: CartModel, index?: number): boolean => {
    const { notes = [] } = options;

    return notes.indexOf(undefined === index ? -1 : index) >= 0;
  };

  const { cartSelected = [], notes = [] } = options;
  const cartSelectedAll = cartSelected.length === cart.models?.length;

  let canCheckout = true;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={styles.container}
      >
        {!cart.modelsLoaded ? (
          <View style={{ paddingTop: 5 }}>
            {[1, 2].map((item) => (
              <View key={item} style={[wrapper.row, { alignItems: 'center', marginTop: 24 }]}>
                <BoxLoading width={20} height={20} style={{ marginRight: 24 }} />

                <BoxLoading width={56} height={56} />

                <View style={{ flex: 1, paddingLeft: 15 }}>
                  <BoxLoading width={180} height={16} />
                  <BoxLoading width={[100, 120]} height={16} style={{ marginTop: 4 }} />
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={{ flex: 1, paddingTop: 5 }}>
            {!cart.models?.length ? (
              <>
                <Image source={{ uri: 'https://www.callkirana.in/bootstrp/images/no-product.png' }} style={styles.sorry} />
                <Typography textAlign="center" style={{ marginVertical: 12 }}>
                  {`${t('Keranjang Belanjamu Kosong')}`}
                </Typography>
                {/* <PressableBox
                  onPress={() => \}>
                  <Typography style={{textAlign: 'center', color: 'blue', textDecorationLine: 'underline'}}>
                    Belanja sekarang..
                  </Typography>
                </PressableBox> */}
              </>
            ) : (
              <View>
                {/* <View style={[styles.cartContent, { paddingTop: 4 }]}>
                  <View style={{ width: 30, marginRight: 10 }}>
                    <Button
                      containerStyle={{ alignSelf: 'center' }}
                      border={'700'}
                      rounded={4}
                      size={15}
                      onPress={() => handleSelectAll()}
                    >
                      <Ionicons
                        name="checkmark"
                        size={15}
                        color={cartSelectedAll ? colors.gray[700] : 'transparent'}
                      />
                    </Button>
                  </View>

                  <Typography style={{ flex: 1, fontSize: 12 }}>
                    {`${t('Pilih Semua')}`}
                  </Typography>
                </View> */}
                
                {cart.models.map((item, index) => (
                  <View key={index} style={{borderColor: '#f1f1f1', borderWidth: 1, marginVertical: 5, borderRadius: 5}}>
                    <View style={styles.cartContent}>
                      {/* <View style={{ width: 30, marginRight: 10 }}>
                        <Button
                          containerStyle={{ alignSelf: 'center' }}
                          border={'700'}
                          rounded={4}
                          size={15}
                          // onPress={() => handleSelect(item, index)}
                          onPress={() => handleSelectAll()}
                        >
                          <Ionicons
                            name="checkmark"
                            size={15}
                            // color={isCartSelected(item, index) ? colors.gray[700] : 'transparent'}
                            color={cartSelectedAll ? colors.gray[700] : 'transparent'}
                          />
                        </Button>
                      </View> */}

                      {!item.product?.prd_foto ? null : (
                        item.product?.merk == 'ADLENS' ? 
                        <Image source={{ uri: item.product?.prd_foto }} style={styles.cartImage} /> :
                        <Image source={{ uri: item.product?.images[0].prd_foto }} style={styles.cartImage} />
                      )}

                      <View style={{ flex: 1, paddingHorizontal: 10 }}>
                        {/* <Typography size="xs" color={500}>
                          {startCase(item.type)}
                        </Typography> */}

                        <Typography size="sm" style={{ marginTop: 2 }}>
                          {item.product?.prd_ds} {item.atributColor === '0' ? 'CLEAR' : item.atributColor}
                        </Typography>

                        <Typography size="xs">
                          {!item.product?.harga_promo ? null : (
                            <Typography color="secondary" style={{
                              fontStyle: 'italic',
                              textDecorationLine: 'line-through',
                              textDecorationStyle: 'solid',
                              lineHeight: 24
                            }}>
                              {formatCurrency({ amount: Number(item.product?.harga_promo), code: 'IDR' })}

                              {'\n'}
                            </Typography>
                          )}

                          <Typography heading size="xs">
                            {item.pid === item.pid && item.paket > 1 
                              ? 
                              formatCurrency({ amount: Number(item.product?.harga || item.hargapaket)/Number(item.product?.package)*Number(item.qty), code: 'IDR' }) 
                              : 
                              formatCurrency({ amount: Number(item.product?.harga || item.hargapaket)*Number(item.qty), code: 'IDR' }) 
                            }
                          </Typography>
                        </Typography>

                        {item.atributColor === '' || item.atributColor === '' ? null :
                          <View>
                            {item.product?.description == "ACCS" ? null : (
                                <Typography size="xs" style={{ marginTop: 2 }}>
                                  Kode : {item.pid || item.pid2}
                                </Typography>
                              )
                            }
                            {item.atributSpheries3 === '' ? null :
                            (
                              <View>
                                <Typography size="xs" style={{ marginTop: 2 }}>
                                  Warna : {item.atributColor === '0' ? 'CLEAR' : item.atributColor || item.atributColor3}
                                </Typography>
                                <Typography size="xs" style={{ marginTop: 2 }}>
                                  Ukuran : {item.atributSpheries || item.atributSpheries3}
                                </Typography>
                              </View>
                            )}

                            {item.atributBcurve3 === '' ? null :
                            (
                              <Typography size="xs" style={{ marginTop: 2 }}>
                                Base Curve : {item.atributBcurve == '' ? '-' : item.atributBcurve}
                              </Typography>
                            )}
                          </View>
                        }
                      </View>
                    </View>

                    <View style={styles.cartAction}>
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <PressableBox
                          containerStyle={{ alignSelf: 'flex-start' }}
                          onPress={() => handleNoteShow(item, index)}
                        >
                          <Typography color="#0d674e" size="xs">
                            {`${t('Tambah Catatan')}`}
                          </Typography>
                        </PressableBox>

                        {notes.indexOf(index) < 0 ? null : (
                          <TextField
                            containerStyle={{ marginTop: 4 }}
                            style={{ fontSize: 11 }}
                            placeholder={`${t('Tulis catatan disini..')}`}
                            border
                            multiline
                            value={item.note}
                            onChangeText={(value) => setCart(state => ({
                              ...state,
                              models: cart.models?.map((cartModel, i) => {
                                if (i === index) {
                                  const newCart = { ...cartModel };
                                  newCart.note = value;
                                  return newCart;
                                }

                                return cartModel;
                              }) || [],
                            }))}
                          />
                        )}
                      </View>

                      <View style={[wrapper.row, {
                        alignSelf: 'flex-end',
                        alignItems: 'center'
                      }]}>
                        <Button
                          containerStyle={{ marginHorizontal: 10 }}
                          size={24}
                          rounded={4}
                          onPress={() => handleQtyChange(0, item, index)}
                        >
                          <Ionicons name="trash-outline" size={20} color={colors.gray[700]} />
                        </Button>
                        {item.paket > 1 ? (
                          <TextField 
                            containerStyle={{ width: 60, paddingHorizontal: 10, backgroundColor: '#f1f1f1', marginRight: 10 }}
                            value={item.qty?.toString() == '' ? '1' : item.qty?.toString()}
                            border
                            textAlign='center'
                            size="sm"
                            editable={false}
                          />
                        ) : (
                          <TextFieldNumber
                            containerStyle={{ width: 86, paddingHorizontal: 4, marginRight: 10 }}
                            placeholder="0"
                            value={item.qty?.toString() == '' ? '1' : item.qty?.toString()}
                            border
                            size="sm"
                            buttonProps={{ size: 24 }}
                            editable
                            onChangeText={(value) => !value ? void(0) : handleQtyChange(parseInt(value), item, index, false)}
                            onIncrease={() => handleQtyChange('+', item, index)}
                            onDecrease={() => handleQtyChange('-', item, index)}
                          />
                        )}
                      </View>
                    </View>
                  </View>
                ))}

              </View>
            )}
          </View>
        )}
      </ScrollView>

      {!cart.modelsLoaded /*|| !price.isLoaded*/ ? null : (
        !cart.models?.length ? null : (
          <View style={styles.action}>
            {/* <View style={[wrapper.row, { alignItems: 'center' }]}>
              <Typography size='md' color="black" style={{ flex: 1, paddingVertical: 4 }}>
                {`${t('Total Harga')}`}
              </Typography>

              <Typography textAlign="right">
                {!price.original ? null : (
                  <Typography size="lg" color="secondary" style={{
                    fontStyle: 'italic',
                    textDecorationLine: 'line-through',
                    textDecorationStyle: 'solid',
                    lineHeight: 24
                  }}>
                    {numeral(price.original).format()}

                    {'\n'}
                  </Typography>
                )}

                <Typography type="h4">
                  {numeral(price.total).format()}
                </Typography>
              </Typography>
            </View> */}

            <PressableBox
              containerStyle={{ marginTop: 16, alignSelf: 'center', marginVertical: 15, backgroundColor: '#0d674e' }}
              style={{ width: 320, height: 40 }}
              onPress={handleCheckout}
              disabled={!canCheckout}
            >
              <Typography size='sm' style={{textAlign: 'center', paddingVertical: 10, color: '#FEFEFE'}}>
                {`${t('Checkout')}`.toUpperCase()}
              </Typography>
            </PressableBox>
          </View>
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 15,
    paddingBottom: 16,
    backgroundColor: colors.white,
  },

  cartRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: colors.palettes.primary,
    paddingHorizontal: 8,
    marginHorizontal: -8,
  },
  cartContent: {
    ...wrapper.row,
    alignItems: 'center',
    marginTop: 10,
  },
  cartImage: {
    width: 70,
    height: 50,
    resizeMode: 'stretch',
    alignSelf: 'flex-start',
    marginTop: -5,
  },
  cartAction: {
    ...wrapper.row,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 10
  },
  sorry: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginTop: 120
  },
  action: {
    paddingTop: 8,
    paddingBottom: 16,
    paddingHorizontal: 15,
    borderTopWidth: 1,
    borderColor: colors.gray[400],
    backgroundColor: colors.white
  }
});

export default Cart;