import { RouteProp, useRoute } from '@react-navigation/core';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, View, ToastAndroid } from 'react-native';
import { colors, shadows, wrapper } from '../../../lib/styles';
import { useAppNavigation } from '../../../router/RootNavigation';
import { PressableBox, Typography } from '../../../ui-shared/components';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AddressModel, CartModel, Modelable, PaymentMethodType } from '../../../types/model';
import { PublicHomeStackParamList } from '../../../router/publicBottomTabs';
import { httpService } from '../../../lib/utilities';
import { BoxLoading } from '../../../ui-shared/loadings';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../../redux/hooks';

export const PAYMENT_IMAGES: {
  [key: string]: any;
} = {
  'Mandiri': require('../../../assets/images/payments/bank-mandiri.png'),
  'COD': require('../../../assets/images/payments/qris.png'),
};

function PaymentMethod() {
  // Hooks
  const navigation = useAppNavigation();
  const route = useRoute<RouteProp<PublicHomeStackParamList, 'PaymentMethod'>>();
  const { t } = useTranslation('home');
  const { user, location } = useAppSelector(({ user }) => user);
  const [address, setAddress] = useState<Modelable<AddressModel>>({
    model: null,
    modelLoaded: false,
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType | null>(null);
  // States
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [method, setMethod] = useState<Modelable<PaymentMethodType>>({
    models: [],
    modelsLoaded: false,
  });
  const [token, setToken] = useState('');
  const [orderID, setOrderID] = useState('');
  const [cart, setCart] = useState<Modelable<CartModel>>({
    models: [],
    modelsLoaded: false,
  });

  // Effects
  useEffect(() => {
    const { cart_items, address } = route.params;
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
    let today = new Date();
    let date = today.getDate()+''+Number(today.getMonth()+1)+''+today.getFullYear();
    let randomNumber = Math.floor(Math.random() * 100000) + 1;
    setOrderID('OT-'+date+'-'+randomNumber)
  }, [route.params]);

  useEffect(() => {
    handleRefresh();
  }, []);

  // Vars
  const handleRefresh = async () => {
    setIsLoading(true);

    await retrieveMethods();

    setIsLoading(false);
  };

  const retrieveMethods = async () => {
    return httpService('/api/transaction/transaction', {
      data: {
        act: 'PaymentList',
        dt: JSON.stringify({ comp: '001' }),
      }
    }).then(({ status, data }) => {
      if (200 === status) {
        setMethod(state => ({
          ...state,
          models: data,
          modelsLoaded: true
        }));
      }
    });
  };

  const paymentMethodType = paymentMethod?.payment_type || '';
   
  const handleSubmitCC = async () => {
    const { model: addressModel } = address;
    setIsSaving(true);
    return httpService('/api/transaction/transaction', {
      data: {
        act: 'OrderNew',
        header: JSON.stringify({
          regid: user?.id,
          invnumber: orderID,
          paymethod: paymentMethod?.payment_name || 'credit_card',
          paytype: 'credit_card',
          type: 'credit_card',
          paytoken: token || null,
          accountnumber: null,
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
      if(status == 200){
        setIsLoading(true)
        navigation.navigatePath('Public', {
          screen: 'WebviewCC',
          params: [{ 
            snapUrl: 'https://app.sandbox.midtrans.com/snap/v3/redirection/'+data+'#/payment-list',
            orderid: orderID,
            cart_items: cart.models,
            address: address.model,
            price_total: route.params.price_total,
            ekspedisi: route.params.ekspedisi,
            jenis: route.params.jenis,
            biayaongkir: route.params.biayaongkir
          }],
        });
        setIsLoading(false)
      }
    }).catch(() => {
      setIsSaving(false);
      // ToastAndroid.show(`${t('Mohon maaf, fitur ini sedang dalam pengerjaan.')}`, ToastAndroid.SHORT);
    }).finally(() => setIsLoading(false));
  };

  const handleMethodSelect = (payment_method: PaymentMethodType) => {
    if(payment_method.type == 'credit_card'){
      handleSubmitCC()
    }else{
      console.log(route.params?.ekspedisi, route.params?.jenis, route.params?.biayaongkir)
      navigation.navigatePath('Public', {
        screen: 'PaymentMerchant',
        params: [{
          address: route.params?.address,
          cart_items: route.params?.cart_items,
          price_total: route.params?.price_total,
          payment_method,
          ekspedisi: route.params?.ekspedisi,
          jenis: route.params?.jenis,
          biayaongkir: route.params?.biayaongkir
        }],
      });
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* {true ? null : ( */}
        <View style={[styles.header, { paddingTop: 8 }]}>
          <Typography
            size="xs"
            style={{
              borderBottomWidth: 1,
              borderColor: colors.gray[700],
              paddingVertical: 10,
            }}
          >
            {`${t('Pilih Metode Pembayaran')}`}
          </Typography>
        </View>
      {/* )} */}

      <ScrollView contentContainerStyle={styles.container}>
        {!method.modelsLoaded ? (
          <>
            <BoxLoading width={320} height={60} style={{ marginVertical: 5 }} />
            <BoxLoading width={320} height={60} style={{ marginVertical: 5 }} />
            <BoxLoading width={320} height={60} style={{ marginVertical: 5 }} />
            <BoxLoading width={320} height={60} style={{ marginVertical: 5 }} />
            <BoxLoading width={320} height={60} style={{ marginVertical: 5 }} />
            <BoxLoading width={320} height={60} style={{ marginVertical: 5 }} />
            <BoxLoading width={320} height={60} style={{ marginVertical: 5 }} />
          </>
        ) : (
          !method.models?.length ? (
            <Typography style={{ marginVertical: 12 }}>
              {`${t('Tidak ada metode pembayaran')}`}
            </Typography>
          ) : (
            [
              ...(method.models || []),
              // { nama: `${t('COD')}` }
            ].map((item, index) => {
              let nama = item.nama;

              switch (item.payment_type) {
                case 'CC':
                  nama = `${item.nama}`;
                  item.payment_type = 'CC';
                  break;
                case 'STR':
                  nama = `${item.nama}\n(Alfamart, ALfamidi, Dan+Dan, Lawson)`;
                  item.payment_type = 'STR';
                  break;
                case 'VA':
                  nama = `${item.nama}\n${item.remark}`;
                  item.payment_type = 'VA';
                  break;
                case 'EW':
                  nama = `${item.nama}\n${item.remark}`;
                  item.payment_type = 'EW';
                  break;
                case 'CLC':
                  nama = `${item.nama}\n${item.remark}`;
                  item.payment_type = 'CLC';
                  break;
                default:
                  nama = `${item.nama}\nNomor Rekening :  ${item.label}`;
                  item.payment_type = 'TRF';
              }

              return (
                <PressableBox
                  key={index}
                  containerStyle={{
                    ...styles.methodRow,
                    marginTop: index === 0 ? 0 : 0
                  }}
                  style={styles.method}
                  onPress={() => handleMethodSelect(item)}
                >
                  {item.image === '' ? (
                    null
                  ) : (
                    <Image source={{ uri: item.image }} style={styles.methodImage} />
                  )}
    
                  <View style={{ flex: 1, paddingHorizontal: 10 }}>
                    <Typography style={{fontSize: 11, paddingVertical: 10}}>{nama}</Typography>
                  </View>
    
                  {/* <Ionicons name="chevron-forward" size={20} color='#333' /> */}
                </PressableBox>
              );
            })
          )
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 15,
    paddingTop: 8,
    paddingBottom: 24,
    backgroundColor: colors.white,
  },

  header: {
    paddingTop: 4,
    paddingHorizontal: 15,
    backgroundColor: colors.white,
  },

  methodRow: {
    marginHorizontal: 0,
    backgroundColor: colors.white,
    ...shadows[3],
    marginBottom: 10
  },
  method: {
    ...wrapper.row,
    paddingHorizontal: 15,
    paddingVertical: 10,
    alignItems: 'center'
  },
  methodImage: {
    width: 45,
    height: 20,
    resizeMode: 'contain',
  },
});

export default PaymentMethod;
