import { useRoute, RouteProp } from '@react-navigation/core';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, 
        useWindowDimensions, View, Image, ImageBackground, Alert,ToastAndroid } from 'react-native';
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

function WebviewInvoice() {
  // Hooks
  const navigation = useAppNavigation();
  const route = useRoute();
  const { width, height } = useWindowDimensions();
  const { t } = useTranslation('payment');
  const dispatch = useDispatch();
  const [transactionId, setTransactionId] = useState('');
  const { user, location } = useAppSelector(({ user }) => user);

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
  const [cart, setCart] = useState<Modelable<CartModel>>({
    models: [],
    modelsLoaded: false,
  });
  const [error, setError] = useState<ErrorState<Fields>>({
    fields: [],
    message: undefined,
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType | null>(null);
  const paymentMethodType = paymentMethod?.payment_type || '';

  useEffect(() => {
    // ToastAndroid.show(route.params.snapUrl, ToastAndroid.LONG);
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <WebView 
            style={{flex: 1}}
            mediaPlaybackRequiresUserAction={false}
            domStorageEnabled={true}
            allowsInlineMediaPlayback={true}
            startInLoadingState={true}
            allowUniversalAccessFromFileURLs={true}
            source={{ uri: `${route.params.snapUrl}` }} 
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

export default WebviewInvoice;
