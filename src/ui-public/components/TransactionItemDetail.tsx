import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, ToastAndroid, View, ViewProps } from 'react-native';
import { Button, ButtonProps, PressableBox, Typography } from '../../ui-shared/components';
import { colors, wrapper } from '../../lib/styles';
import * as Animatable from 'react-native-animatable';
import { AddressModel, CartModel, Modelable, PaymentMethodType, ProductModel, TransactionModel, TransactionStatus } from '../../types/model';
import { FigmaIcon } from '../../assets/icons';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import numeral from 'numeral';
import { getStatusColor, getStatusText, httpService, showPhone } from '../../lib/utilities';
import { useAppNavigation } from '../../router/RootNavigation';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { PAYMENT_IMAGES } from '../pages/company/PaymentMethod';
import { BoxLoading } from '../../ui-shared/loadings';
import { PAYMENT_METHODS } from '../pages/orders/PaymentMerchant';
import Clipboard from '@react-native-clipboard/clipboard';

type Props = ViewProps & {
  transaction: TransactionModel;
  collapse?: boolean;
  onDetailPress?: (transaction: TransactionModel) => void;
  onPayPress?: (transaction: TransactionModel) => void;
  onInfoUpdate?: (transaction: TransactionModel) => void;
};

function TransactionItemDetail({
  transaction,
  collapse: isCollapse = true,
  onDetailPress,
  onPayPress,
  onInfoUpdate,
  style,
  ...props
}: Props) {
  // Hooks
  const navigation = useAppNavigation();
  const { t } = useTranslation('notification');
  const status = transaction.orderstatus as TransactionStatus;

  const renderHeaderShrink = () => {
    return (
      <View style={{
        paddingVertical: 8,
        paddingHorizontal: 15,
      }}>
        <View style={[wrapper.row]}>
          <FigmaIcon.FigmaShoppingBag width={24} height={24} color={colors.gray[900]} />
          <View style={{flex: 1}}>
            <Typography size="xs" style={{ marginTop: 4, marginBottom: 10, marginLeft: 10, fontWeight: 'bold'}}>
              {`${transaction.nm_store}`}
            </Typography>
          </View>
          <View>
            <Typography size="xs">
              Lihat Detail
            </Typography>
          </View>
        </View>
        <View style={[wrapper.row, { alignItems: 'center' }]}>
          <View style={{ flex: 1, marginRight: 15 }}>
            <Typography size="xs">
            {`${transaction.orderno}`}
            </Typography>

            <Typography size="xs">
              {moment(transaction.ordertgl, 'YYYYMMDD').format('D MMMM YYYY')}
            </Typography>
          </View>

          <View>
            <Typography
              heading
              size="xs"
              color={getStatusColor(status)}
              style={{ alignSelf: 'flex-end' }}
            >
              {getStatusText(status)}
            </Typography>
          </View>
        </View>
      </View>
    );
  };

  const goToDetail = () => {
    navigation.navigatePath('Public', {
      screen: 'DetailTransaksi',
      params: [{
        invoice: transaction.orderno,
        kodebayar: transaction.paymentcode,
        metode: transaction.methodds,
        totalbelanja: transaction.totalbelanja,
        status: getStatusText(status),
        statuscolor: getStatusColor(status)
      }]
    });
  }

  return (
    <View style={[styles.container, style, 
                { borderColor: '#cccccc',
                  borderRadius: 5, 
                  borderWidth: 1 }]} {...props}>
      <PressableBox
        containerStyle={{ marginHorizontal: 0, overflow: 'visible' }}
        style={{ paddingHorizontal: 0 }}
        onPress={() => goToDetail()}
      >
        {renderHeaderShrink()}
      </PressableBox>
    </View>
  )
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 4,
    backgroundColor: colors.white,
    overflow: 'hidden'
  },

  headerCart: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.transparent('palettes.primary', 0.5),
  },
  headerCartImage: {
    width: 64,
    height: 64,
    borderRadius: 10,
    marginRight: 12,
    resizeMode: 'contain'
  },

  contentWrapper: {
    overflow: 'hidden',
    height: 0,
  },
  content: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingTop: 8,
    paddingHorizontal: 15,
    paddingBottom: 15,
  },

  contentSection: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray[400],
  }
});

export default TransactionItemDetail;