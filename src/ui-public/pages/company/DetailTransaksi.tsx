import { CommonActions, RouteProp, useRoute } from '@react-navigation/core';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, ToastAndroid, useWindowDimensions, View, Linking, BackHandler } from 'react-native';
import { colors, shadows, wrapper } from '../../../lib/styles';
import { useAppNavigation } from '../../../router/RootNavigation';
import { BottomDrawer, Button, ImageAuto, PressableBox, TextField, Typography, RenderHtml } from '../../../ui-shared/components';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { PublicHomeStackParamList } from '../../../router/publicBottomTabs';
import { AddressModel, CartModel, Modelable, PaymentMethodType } from '../../../types/model';
import numeral from 'numeral';
import { ErrorState, ValueOf  } from '../../../types/utilities';
import { BannerWelcome } from '../../../assets/images/banners';
import { httpService, showPhone } from '../../../lib/utilities';
import { useAppSelector } from '../../../redux/hooks';
import { useDispatch } from 'react-redux';
import { setCartItems } from '../../../redux/actions';
import { PAYMENT_IMAGES } from './PaymentMethod';
import { useTranslation } from 'react-i18next';
import Clipboard from '@react-native-clipboard/clipboard';
import RenderHTML from 'react-native-render-html';
import { BoxLoading } from '../../../ui-shared/loadings';
import {
  formatCurrency,
  getSupportedCurrencies,
} from "react-native-format-currency";

type Fields = {
  bank_number?: string;
  bank_account_name?: string;
  price_total?: number;
};

function DetailTransaksi() {
  // Hooks
  const navigation = useAppNavigation();
  const route = useRoute<RouteProp<PublicHomeStackParamList, 'PaymentMerchant'>>();
  const { width, height } = useWindowDimensions();
  const { user, location } = useAppSelector(({ user }) => user);
  const dispatch = useDispatch();
  const { t } = useTranslation('home');

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType | null>(null);
  const [cart, setCart] = useState<Modelable<CartModel>>({
    models: [],
    modelsLoaded: false,
  });
  const [address, setAddress] = useState<AddressModel | null>(null);
  const [error, setError] = useState<ErrorState<Fields>>({
    fields: [],
    message: undefined,
  });
  const [price, setPrice] = useState({
    total: 0,
    courier: 0,
  });

  useEffect(() => {
    handleRefresh();
  }, []);

  const getFieldError = (field: keyof Fields) => {
    const { fields = [] } = error;

    return fields.indexOf(field) < 0 ? null : error.message;
  };

  const { models: cart_items } = cart;
  const cartItem = !cart_items?.length ? null : cart_items[0];

  const handleRefresh = async () => {
    retrieveDetailTransaksi();
  };

  const retrieveDetailTransaksi = async () => {
    // setIsLoading(true);

    return httpService('/api/transaction/transaction', {
      data: {
        act: 'DetailTransaksi',
        dt: JSON.stringify({ idtrx : route.params.invoice }),
      }
    }).then(({ status, data, item, shipTo }) => {
      setIsLoading(false);
      const cartItems = 200 !== status ? [] : itemsToCart(item || []);
      const infoAddress = !shipTo ? null : {
        id: shipTo.id,
        alamat: shipTo.ship_alamat,
        vch_nama: shipTo.ship_nama,
        hp: shipTo.ship_hp,
      };

      setCart(state => ({
        ...state,
        models: cartItems,
        modelsLoaded: true,
      }));
      setAddress(infoAddress);
    }).then(() => {
      setIsLoading(false);

      setCart(state => ({
        ...state,
        modelsLoaded: true
      }));
    });
  };

  const itemsToCart = (items: any[]): CartModel[] => {
    let priceTotal = 0;
    const cartItems = items.map((item): CartModel => {
      const subtotal = parseFloat(item.amount) || (parseFloat(item.qtyorder) * parseFloat(item.unit_price));
      priceTotal += subtotal;
 
      return {
        product: {
          prd_id: item.prdid,
          prd_no: item.prdno,
          prd_ds: item.prdds,
          prd_foto: item.foto || item.prdfoto || item.prd_foto,
        },
        qty: parseFloat(item.qtyorder),
        harga: item.unit_price,
      };
    });

    setPrice(state => ({
      ...state,
      total: priceTotal
    }));

    return cartItems;
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View>
          <Image source={require('../../../assets/logocard-removebg-preview.png')} style={{width: 135, height: 40, marginTop: -5, marginLeft: 5}}/>
        </View>
        <Typography size="md" style={{textAlign: 'center', marginVertical: 20}}>
          {`${t('Rincian Transaksi.')}`}
        </Typography>
        <View style={[wrapper.row, styles.card]}>
          <Typography size="xs">
            Nomor Invoice
          </Typography>
          <View style={{flex: 1}}>
            <Typography size='sm' style={{ alignSelf: 'flex-end' }}>
              {route.params.invoice}     
            </Typography>
          </View>
          {!getFieldError('price_total') ? null : (
            <Typography size="xs" color="red" style={{ marginTop: 4 }}>
              {error.message}
            </Typography>
          )}
        </View>
        <View style={[wrapper.row, styles.card]}>
          <Typography size="xs">
            Total Pembayaran
          </Typography>
          <View style={{flex: 1}}>
            <Typography size='sm' style={{ alignSelf: 'flex-end' }}>
              {/* {numeral(fields.price_total).format()} */}
              {formatCurrency({ amount: Number(route.params.totalbelanja), code: 'IDR' })}        
            </Typography>
          </View>
          {!getFieldError('price_total') ? null : (
            <Typography size="xs" color="red" style={{ marginTop: 4 }}>
              {error.message}
            </Typography>
          )}
        </View>
        <View style={[wrapper.row, styles.card]}>
            <Typography size="xs">
              Status Pembayaran
            </Typography>
            <View style={{flex: 1}}>
              <Typography size='xs' style={{ alignSelf: 'flex-end', color: route.params.statuscolor }}>
                {route.params.status}  
              </Typography>
            </View>
        </View>
        <View style={[wrapper.row, styles.card]}>
            <Typography size="xs">
              Metode Pembayaran
            </Typography>
            <View style={{flex: 1}}>
              <Typography size='xs' style={{ alignSelf: 'flex-end', color: 'green' }}>
                {route.params.metode}  
              </Typography>
            </View>
        </View>
        {/* <View style={[wrapper.row, styles.card]}>
            <Typography size="xs">
              Batas Waktu Pembayaran
            </Typography>
            <View style={{flex: 1}}>
              <Typography size='xs' style={{ alignSelf: 'flex-end', color: 'green' }}>
                {route.params.metode}  
              </Typography>
            </View>
        </View> */}
        {route.params.status == 'PEMBAYARAN BERHASIL' ? (
          <View style={{borderColor: 'green', borderWidth: 1, borderRadius: 5, marginTop: 20}}>
            <Typography size='xs' style={{paddingHorizontal: 5, paddingVertical: 5, textAlign: 'center'}}>
              {`\n`}
              <Ionicons name="checkmark-circle-outline" size={30} color={'green'} />
              {`\nPembayaran pesanan berhasil. `}
              {`\nkami akan segera memproses dan mengirimkan pesanan ke alamat anda.`}
            </Typography>
          </View>
        ) : 
          route.params.kodebayar != "" ? (
            <View style={{borderColor: '#333', borderWidth: 1, borderRadius: 5, marginTop: 20}}>
              <Typography size='xs' style={{paddingHorizontal: 5, paddingVertical: 5, textAlign: 'center'}}>
                {`Kode Pembayaran / Virtual Accoount\n\n`}
                    <Typography type='h4'>{route.params.kodebayar}</Typography>
              </Typography>
              <PressableBox
                style={{borderColor: 'blue', borderWidth: 1, borderRadius: 5, marginBottom: 10, width: 100, alignSelf: 'center'}}
                onPress={() => {
                  Clipboard.setString(
                    paymentMethod?.payment_name == 'PERMATA' ? route.params.kodebayar.toString() : va.toString()
                  );
  
                  ToastAndroid.show(`${''}Berhasil disalin`, ToastAndroid.LONG);
                }}>
                  <Typography size='xs' style={{color: 'blue', textAlign: 'center', paddingVertical: 5}}>
                    Salin <Ionicons name="copy-outline" size={12} color={'blue'} />
                  </Typography>
              </PressableBox>
            </View>
          ) : null
        }
        <View>
          <Typography size='sm' style={{marginVertical: 10, fontWeight: '700'}}>Dikirim ke:</Typography>
          {isLoading ? (
            <View style={styles.contentSection}>
              <BoxLoading width={[120, 180]} height={20} />
              <BoxLoading width={[180, 280]} height={18} style={{ marginTop: 8 }} />
              <BoxLoading width={[180, 280]} height={18} style={{ marginTop: 4 }} />
              <BoxLoading width={[120, 160]} height={18} style={{ marginTop: 4 }} />
            </View>
          ) : (
            <>
              {!address ? null : (
                <View style={styles.contentSection}>
                  <View style={[wrapper.row, { marginTop: 6 }]}>
                    <View style={{ flex: 1 }}>
                      <Typography size='sm' style={{ marginTop: 4 }}>
                        {address?.vch_nama}
                      </Typography>

                      <Typography size="xs" style={{ marginTop: 4 }}>
                        {showPhone(address?.hp, '+62')}
                      </Typography>

                      <Typography size="xs" style={{ marginTop: 4, textAlign: 'justify' }}>
                        {address?.alamat}
                      </Typography>
                    </View>
                  </View>
                </View>
              )}
            </>
          )}
          <Typography size='sm' style={{marginVertical: 10, fontWeight: '700'}}>Detail Produk</Typography>
          {cart_items?.map((item, index) => {
            const image = !item?.product?.images?.length ? item?.product?.prd_foto : item.product.images[0].prd_foto;

            return (
              <View key={index} style={[wrapper.row, { marginTop: 5 }]}>
                <View style={{ flex: 1, paddingTop: 2 }}>
                  <View style={[wrapper.row, { flex: 1 }]}>
                    <Typography size="xs" style={{flex: 1}}>
                      {item.product?.prd_ds} ({item.qty})
                    </Typography>

                    <Typography size="xs" style={{ marginTop: 2 }}>
                      {formatCurrency({
                        amount: Number(item.harga)*Number(item.qty),
                        code: 'IDR',
                      })}
                    </Typography>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 24,
    backgroundColor: colors.white,
  },
  contentSection: {
    borderTopWidth: 1,
    borderTopColor: colors.gray[400],
  },
  header: {
    paddingTop: 4,
    paddingHorizontal: 15,
    backgroundColor: colors.white,
  },
  headerRow: {
    ...wrapper.row,
    alignItems: 'flex-end',
    borderBottomWidth: 1,
    borderColor: colors.transparent('palettes.primary', 1),
    paddingVertical: 4,
  },
  methodImage: {
    width: 45,
    height: 20,
    resizeMode: 'contain',
  },
  card: {
    paddingVertical: 3,
    paddingHorizontal: 0,
    backgroundColor: colors.white
  },
  cardInfo: {
    marginTop: 12,
    backgroundColor: colors.transparent('palettes.primary', 0),
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderRadius: 8
  },

  action: {
    paddingTop: 12,
    paddingVertical: 16,
    paddingHorizontal: 15,
    backgroundColor: colors.white
  },
});

export default DetailTransaksi;