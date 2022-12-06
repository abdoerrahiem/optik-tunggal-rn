import { useRoute, RouteProp } from '@react-navigation/core';
import React, { useEffect, useState, useRef } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, 
        useWindowDimensions, View, Image, ImageBackground, Alert,ToastAndroid, BackHandler } from 'react-native';
import { colors, shadows, wrapper } from '../../../lib/styles';
import { useAppNavigation } from '../../../router/RootNavigation';
import { Typography, PressableBox, Button } from '../../../ui-shared/components';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../../redux/hooks';
import { WebView } from 'react-native-webview';
import { httpService } from '../../../lib/utilities';
import { AddressModel, CartModel, MidtransModelVA, Modelable, PaymentMethodType } from '../../../types/model';
import { useDispatch } from 'react-redux';
import { PublicHomeStackParamList } from '../../../router/publicBottomTabs';
import { ErrorState, ValueOf } from '../../../types/utilities';
import { setCartItems } from '../../../redux/actions';

type Fields = {
  bank_number?: string;
  bank_account_name?: string;
  price_total?: number;
};

function WebviewCC() {
  // Hooks
  const navigation = useAppNavigation();
  const route = useRoute();
  const { width, height } = useWindowDimensions();
  const { t } = useTranslation('payment');
  const dispatch = useDispatch();
  const [transactionId, setTransactionId] = useState('');
  const { user, location } = useAppSelector(({ user }) => user);

  const [cart, setCart] = useState<Modelable<CartModel>>({
    models: [],
    modelsLoaded: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType | null>(null);
  const paymentMethodType = paymentMethod?.payment_type || '';
  const webViewRef = useRef();

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => backHandler.remove();
  }, []);

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
    
  }, [route.params]);

  const cekPembayaran = async (orderid: string) => {
    return httpService(`/api/transaction/transaction`, {
      data: {
        act: 'CekPaymentCC',
        param: JSON.stringify({
          orderid: orderid
        })
      },
    }).then(({ status, data }) => {
      if(data.status_code === 200){
        Alert.alert("", "Terima kasih sudah melakukan pembayaran.", 
        [
          { text: "Tutup", onPress: () => {
            dispatch(setCartItems([]))
            navigation.navigatePath('Public', { screen: 'BottomTabs.AccountStack.Account'})
          }}
        ],
          { cancelable: false }
        );
      }else{
        Alert.alert("", "Apakah anda ingin ubah metode pembayaran?", 
        [
          { text: "Ya", onPress: () => {
            updatePayment(orderid)
            navigation.navigatePath('Public', {
              screen: 'PaymentMethod',
              params: [{
                cart_items: cart.models,
                address: address.model,
                price_total: route.params?.price_total,
                ekspedisi: route.params?.ekspedisi,
                jenis: route.params?.jenis,
                biayaongkir: route.params?.biayaongkir
              }],
            });
          }},
          { text: "Tidak", onPress: () => {}}
        ],
          { cancelable: false }
        );
      }
    }).catch(() => {
      
    });
  };

  const updatePayment = async (orderid: string) => {
    return httpService(`/api/transaction/transaction`, {
      data: {
        act: 'UpdatePayment',
        param: JSON.stringify({
          orderid: orderid
        })
      },
    }).then(({ status }) => {
    }).catch(() => {
      
    });
  };

  const _bridge = (event: any) => {
    if(event.nativeEvent.data == 'exit') {
      ToastAndroid.show('Pembayaran berhasil', ToastAndroid.LONG);
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={{backgroundColor: '#ccc', height: 40}}>
        <PressableBox
          onPress={() => cekPembayaran(route.params?.orderid)}
        >
          <Typography style={{paddingVertical: 10, alignSelf: 'flex-end', paddingRight: 20}}>Kembali</Typography>
        </PressableBox>
      </View>
      <WebView 
          style={{flex: 1}}
          mediaPlaybackRequiresUserAction={false}
          domStorageEnabled={true}
          allowsInlineMediaPlayback={true}
          startInLoadingState={true}
          allowUniversalAccessFromFileURLs={true}
          source={{ uri: `${route.params.snapUrl}` }}
          onMessage={event => { _bridge(event); }}
        />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 15,
    paddingTop: 0,
    paddingBottom: 24,
    backgroundColor: colors.white,
  },
});

export default WebviewCC;
