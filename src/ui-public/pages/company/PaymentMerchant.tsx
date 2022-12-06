import { CommonActions, RouteProp, useRoute } from '@react-navigation/core';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, ToastAndroid, useWindowDimensions, View, Linking, BackHandler } from 'react-native';
import { colors, shadows, wrapper } from '../../../lib/styles';
import { useAppNavigation } from '../../../router/RootNavigation';
import { BottomDrawer, Button, ImageAuto, PressableBox, TextField, Typography, RenderHtml } from '../../../ui-shared/components';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { PublicHomeStackParamList } from '../../../router/publicBottomTabs';
import { AddressModel, CartModel, MidtransModelVA, Modelable, PaymentMethodType } from '../../../types/model';
import numeral from 'numeral';
import { ErrorState, ValueOf } from '../../../types/utilities';
import { BannerWelcome } from '../../../assets/images/banners';
import { httpService } from '../../../lib/utilities';
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

export const PAYMENT_METHODS = [
  {
    method: 'transfer',
    bankName: 'BCA',
    bankNo: '123-456-789-0',
    bankAccount: 'PT OPTIK TUNGGAL SEMPURNA',
  }
];

type Fields = {
  bank_number?: string;
  bank_account_name?: string;
  price_total?: number;
};

function PaymentMerchant() {
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
  const [midtrans, setMidtrans] = useState([]);
  const [va, setVa] = useState([]);
  const [address, setAddress] = useState<Modelable<AddressModel>>({
    model: null,
    modelLoaded: false,
  });
  const [fields, setFields] = useState<Fields>({
    bank_number: '',
    bank_account_name: '',
    price_total: 0,
  });
  const [error, setError] = useState<ErrorState<Fields>>({
    fields: [],
    message: undefined,
  });
  const [options, setOptions] = useState({
    infoModalOpen: false,
  });

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => backHandler.remove();
  }, []);

  // Effects
  useEffect(() => {
    const { cart_items, address, payment_method } = route.params;
    address && setAddress(state => ({
      ...state,
      model: address,
      modelLoaded: true
    }));
    cart_items && setCart(state => ({
      ...state,
      models: cart_items,
      modelsLoaded: true,
    }));
    payment_method && setPaymentMethod(payment_method);
    
  }, [route.params]);

  useEffect(() => {
    calculatePrice();
  }, [cart.models]);

  useEffect(() => {
    setIsLoading(true);
    paymentMethod && handleSubmit();
  }, [paymentMethod]);

  // Vars
  const handleModalToggle = async (type: string, open: boolean | null = null, redirect: boolean = false) => {
    switch (type) {
      case 'info':
        const toggle = 'boolean' === typeof open ? open : !options.infoModalOpen;

        setOptions(state => ({
          ...state,
          infoModalOpen: toggle
        }));

        (!toggle && redirect) && handleFinish();
        break;
    }
  };

  const handleFieldChange = (field: keyof Fields, value: ValueOf<Fields>) => {
    const { fields = [] } = error;

    setFields(state => ({
      ...state,
      [field]: value
    }));

    fields.indexOf(field) >= 0 && setError({
      fields: [],
      message: undefined,
    });
  };

  const handleErrorShow = (fields: keyof Fields | Array<keyof Fields>, message: string) => {
    ToastAndroid.show(message, ToastAndroid.SHORT);

    setError({
      fields: 'string' === typeof fields ? [fields] : fields as Array<keyof Fields>,
      message
    });
  };

  const getFieldError = (field: keyof Fields) => {
    const { fields = [] } = error;

    return fields.indexOf(field) < 0 ? null : error.message;
  };

  const handleSubmit = async () => {
    const { model: addressModel } = address;
    let today = new Date();
    let date = today.getDate()+''+Number(today.getMonth()+1)+''+today.getFullYear();
    let randomNumber = Math.floor(Math.random() * 100000) + 1;
    console.log('ABC :', cart.models);
    setIsSaving(true);
    return httpService('/api/transaction/transaction', {
      data: {
        act: 'OrderNew',
        header: JSON.stringify({
          regid: user?.id,
          invnumber: 'OT-'+date+'-'+randomNumber,
          paymethod: paymentMethod?.payment_name,
          paytype: paymentMethodType,
          type: paymentMethod?.type,
          paytoken: 'tokenpayfrom_midtrans',
          accountnumber: 'Nomor pembayaran dari midtrans',
          paystatus: 'pending',
          shipto: addressModel?.id || '',
          shiptotal: Number(route.params?.price_total), //+Number(route.params?.biayaongkir),
          ip: location.ip,
        }),
        item_midtrans: JSON.stringify((cart.models || []).map((item) => ({
          id: item.pid || item.product?.prd_id,
          name: item.product?.prd_ds,
          quantity: item.qty,
          price: item.product?.hargapaketsatuan,
        }))),
        item: JSON.stringify((cart.models || []).map((item) => ({
          id: item.pid,
          basecurve: item.atributBcurve == '' ? '0' : item.atributBcurve,
          spheries: item.atributSpheries == '' ? null : item.atributSpheries,
          color: item.atributColor == '' ? null : item.atributColor,
          qty: item.qty,
          harga: item.hargapaket,
          remark: item.note,
        }))),
        item_ship: JSON.stringify({
          id: route.params.ekspedisi,
          name: route.params?.jenis,
          quantity: 1,
          price: route.params?.biayaongkir,
        })
      }
    }).then(({ data, status }) => {
      if(status == 200 && paymentMethod?.payment_name === "GOPAY"){
        openGojekApp(data.actions[1].url)
      }
      dispatch(setCartItems([]));
      setMidtrans(data);
      // ToastAndroid.show(`${data.actions[1].url}`, ToastAndroid.SHORT);
      setVa(data.va_numbers[0].va_number || data.actions[1].url);
      
    }).catch(() => {
      setIsSaving(false);
      // ToastAndroid.show(`${t('Mohon maaf, fitur ini sedang dalam pengerjaan.')}`, ToastAndroid.SHORT);
    }).finally(() => setIsLoading(false));
  };

  const openGojekApp = async(url:  string) => {
    // ToastAndroid.show(`${url}`, ToastAndroid.SHORT);
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        console.log("Aplikasi Gojek belum terinstall!");
      }
    });
  }
  
  const handleFinish = () => {
    dispatch(setCartItems([]));

    navigation.navigatePath('Public', {
      screen: 'BottomTabs.HomeStack.Home',
      params: [],
    });

    // setTimeout(() => {
    //   navigation.navigatePath('Public', {
    //     screen: 'BottomTabs.NotificationStack.Notification',
    //   });
    // }, 165);

    // setTimeout(() => {
    //   navigation.navigatePath('Public', {
    //     screen: 'TransactionList',
    //     params: [null, {
    //       initial: false,
    //     }]
    //   });
    // }, 500);
  };

  const calculatePrice = () => {
    let total = 0;

    cart.models?.forEach(({ qty = 1, ...item }, index) => {
      const subtotal = (item.harga || 0) * qty;

      total += subtotal;
    });

    handleFieldChange('price_total', total);
  };
  
  let title = `${t('Pembayaran')}`;
  let titleImage = null;
  const paymentMethodType = paymentMethod?.payment_type || '';

  switch (paymentMethodType) {
    case 'transfer':
      title = `${t('Transfer Manual')}`;
      titleImage = paymentMethod?.image || PAYMENT_IMAGES[paymentMethod?.nama || ''];
      break;
    case 'cod':
      title = `${t('QRIS')}`;
      titleImage = paymentMethod?.image || PAYMENT_IMAGES[paymentMethod?.nama || ''];
      break;
  }

  const transferInfo = PAYMENT_METHODS.find(item => item.method === paymentMethodType);
  // console.log('Midtrans :'+midtrans.models);
  return (
    <View style={{ flex: 1 }}>
      {/* <View style={[styles.header, { paddingTop: 12 }]}>
        <View style={styles.headerRow}>
          <Typography type="h5" style={{ flex: 1, paddingHorizontal: 8 }}>
            {title}
          </Typography>

          {!titleImage ? null : (
            <ImageAuto source={titleImage} height={24} />
          )}
        </View>
      </View> */}

      <ScrollView contentContainerStyle={styles.container}>
        <Typography size="xs" style={{textAlign: 'center', marginVertical: 30}}>
          {`${t('Pesanan anda berhasil dibuat. silahkan lakukan pembayaran anda.')}`}
        </Typography>
        <View style={[wrapper.row, styles.card]}>
          <Typography size="xs">
            Nomor Invoice
          </Typography>
          <View style={{flex: 1}}>
            <Typography size='xs' style={{ alignSelf: 'flex-end' }}>
              {midtrans.order_id}     
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
              {formatCurrency({ amount: Number(route.params?.price_total)+Number(route.params?.biayaongkir), code: 'IDR' })}        
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
            {!midtrans.transaction_status == 'pending' ? 
              (
                <Typography size='xs' style={{ alignSelf: 'flex-end', color: 'green' }}>
                  Sudah dibayar    
                </Typography>
              ) :
                <Typography size='xs' style={{ alignSelf: 'flex-end', color: 'red' }}>
                  Belum dibayar    
                </Typography>
            }
            </View>
        </View>
        {paymentMethodType == "TRF" ?
          (<View style={{marginTop: 20}}>
            <View style={[wrapper.row, { marginTop: 12 }]}>
              <Typography textAlign="right" size='sm' style={{ minWidth: 12 }}>1.</Typography>

              <View style={{ flex: 1, paddingLeft: 8 }}>
                <Typography size='sm'>
                  {`${t('Silahkan transfer ke rekening yang tertera di bawah ini.')}`}
                </Typography>

                <View style={[wrapper.row, { alignItems: 'center', marginTop: 4, borderWidth: 1, borderColor: '#0d674e', borderRadius: 10 }]}>
                  {!titleImage ? null : (
                    <ImageAuto source={titleImage} width={80} />
                  )}

                  <View style={{ flex: 1, paddingHorizontal: 15, paddingVertical: 15 }}>
                    <Typography heading>
                      <Typography size="xs">
                        {`${t('Nama Bank')}`}
                      </Typography>
                      {`\nBank ${paymentMethod?.payment_name}`}
                    </Typography>

                    <View style={{ marginTop: 4 }}>
                      <Typography size="xs">
                        {`${t('Nomor Rekening')}`}
                      </Typography>

                      <View style={[wrapper.row, { justifyContent: 'flex-start', flex: 1 }]}>
                        <Typography heading style={{flex: 1}}>
                          {`${paymentMethod?.label}`}
                        </Typography>

                        <Button
                          containerStyle={{ marginLeft: 2 }}
                          size={18}
                          onPress={() => {
                            Clipboard.setString(paymentMethod?.label?.toString());

                            ToastAndroid.show(`${''}Berhasil di Copy!`, ToastAndroid.SHORT);
                          }}
                        >
                          <Ionicons name="copy-outline" size={14} color={colors.gray[800]} />
                        </Button>
                      </View>
                    </View>

                    <Typography heading style={{ marginTop: 4 }}>
                      <Typography size="xs">
                        {`${t('Atas Nama')}`}
                      </Typography>
                      {`\n${paymentMethod?.nama}`}
                    </Typography>
                  </View>
                </View>
              </View>
            </View>

            <View style={[wrapper.row, { marginTop: 12 }]}>
              <Typography textAlign="right" style={{ minWidth: 12 }}>2.</Typography>

              <View style={{ flex: 1, paddingLeft: 8 }}>
                <Typography size='sm'>
                  {`${t('Nominal transfer adalah')} `}

                  <Typography heading>
                    {formatCurrency({ amount: Number(route.params?.price_total), code: 'IDR' })}
                  </Typography>

                  {`.`}
                </Typography>
              </View>
            </View>

            <View style={[wrapper.row, { marginTop: 4 }]}>
              <Typography size='sm' textAlign="right" style={{ minWidth: 12 }}>3.</Typography>

              <View style={{ flex: 1, paddingLeft: 8 }}>
                <Typography size='sm'>
                  {`${t('Simpan bukti transfer untuk dikirim melalui aplikasi.')}`}
                </Typography>
              </View>
            </View>
          </View>)
          :
          (
            <View style={{marginTop: 20}}>
              <View style={[wrapper.row, {flex: 1, marginBottom: 20, alignSelf: 'center'}]}>
                <Image source={{ uri: route.params.payment_method?.image }} style={styles.methodImage} />
                <Typography style={{paddingHorizontal: 5, textAlign: 'right'}}>
                  {paymentMethod?.payment_name == 'MANDIRI' ? 'BILL PAYMENT' : route.params.payment_method?.remark}
                </Typography>
              </View>
              {paymentMethodType == "EW" ? null : (
                <View style={{borderColor: '#333', borderWidth: 1, borderRadius: 5, marginBottom: 20}}>
                  {paymentMethod?.payment_name == 'MANDIRI' ?
                    (<Typography size='xs' style={{textAlign: 'center', paddingVertical: 5}}>
                        {`Kode Pembelian : \n`}
                        <Typography type='h4'>{midtrans.biller_code}</Typography>
                      </Typography>)
                    : null}
                  <Typography size='xs' style={{paddingHorizontal: 5, paddingVertical: 5, textAlign: 'center'}}>
                    {`Kode Pembayaran / Virtual Accoount\n\n`}
                      {isLoading ? (<Typography size='xxs' style={{paddingVertical: 5}}>Sedang memuat Kode...</Typography>) :
                        paymentMethod?.payment_name == 'PERMATA' ? 
                        (<Typography type='h4'>{midtrans.permata_va_number}</Typography>) 
                        : 
                        (paymentMethod?.payment_name == 'MANDIRI' ? 
                          <Typography type='h4'>{midtrans.bill_key}</Typography>
                         : <Typography type='h4'>{va}</Typography>)
                      }
                  </Typography>
                  <PressableBox
                    style={{borderColor: 'blue', borderWidth: 1, borderRadius: 5, marginBottom: 10, width: 100, alignSelf: 'center'}}
                    onPress={() => {
                      Clipboard.setString(
                        paymentMethod?.payment_name == 'PERMATA' ? midtrans.permata_va_number.toString() : va.toString() || midtrans.bill_key.toString()
                      );

                      ToastAndroid.show(`${''}Berhasil disalin`, ToastAndroid.LONG);
                    }}>
                      <Typography size='xs' style={{color: 'blue', textAlign: 'center', paddingVertical: 5}}>
                        Salin <Ionicons name="copy-outline" size={12} color={'blue'} />
                      </Typography>
                  </PressableBox>
                </View>
              )}
              {paymentMethod?.payment_name === 'GOPAY' ? (
                <Typography size='sm' style={{marginVertical: 20, textAlign: 'center'}}>Kami akan mengarahkan anda ke aplikasi Gojek</Typography>
              ) : null}
              <RenderHtml 
                tagsStyles={{
                  xsmall: { marginVertical: 0, height: 'auto', fontSize: 6, paddingHorizontal: 15, textAlign: 'justify' }
                }}
                contentWidth={width - 60} 
                source={{ html: route.params.payment_method?.howtobuy }} />
            </View>)
        }
      </ScrollView>
      
      {!cart.modelsLoaded ? null : (
        <View style={styles.action}>
          {paymentMethod?.payment_name === 'GOPAY' ? null : 
          (
            <Button
              containerStyle={{ alignSelf: 'center', borderWidth: 1, borderColor: '#0d674e', borderRadius: 5 }}
              style={{ width: 300 }}
              onPress={handleFinish}
              // loading={isSaving}
            >
              <Typography size='xs' style={{textAlign: 'center', paddingVertical: 5, color: '#0d674e', fontWeight: 'bold'}}>
                {`${t('Kembali ke Home')}`.toUpperCase()}
              </Typography>
            </Button>
          )}
        </View>
      )}
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

export default PaymentMerchant;
