import { RouteProp, useRoute } from '@react-navigation/core';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, ScrollView, StyleSheet, ToastAndroid, useWindowDimensions, View } from 'react-native';
import { colors } from '../../../lib/styles';
import { httpService } from '../../../lib/utilities';
import { useAppSelector } from '../../../redux/hooks';
import { PublicNotificationStackParamList } from '../../../router/publicBottomTabs';
import { useAppNavigation } from '../../../router/RootNavigation';
import { Modelable, TransactionModel } from '../../../types/model';
import { Button, Typography } from '../../../ui-shared/components';
import { BoxLoading } from '../../../ui-shared/loadings';
import TransactionItem from '../../components/TransactionItem';
import TransactionPayModal from '../../components/TransactionPayModal';
import TransactionStatusModal from '../../components/TransactionStatusModal';

type OptionsState = {
  detailModalOpen?: boolean;
  detailModel?: null | TransactionModel;
  payModalOpen?: boolean;
  payModel?: null | TransactionModel;
};

function TransactionDetail() {
  // Hooks
  const navigation = useAppNavigation();
  const route = useRoute<RouteProp<PublicNotificationStackParamList, 'TransactionDetail'>>();
  const { height } = useWindowDimensions();
  const { user } = useAppSelector(({ user }) => user);
  const { t } = useTranslation('notification');

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [transactionId, setTransactionId] = useState<string>('');
  const [transaction, setTransaction] = useState<Modelable<TransactionModel>>({
    model: null,
    modelLoaded: false,
  });
  const [options, setOptions] = useState<OptionsState>({
    detailModalOpen: false,
    detailModel: null,
    payModalOpen: false,
    payModel: null,
  });

  // Effects
  useEffect(() => {
    route.params?.transaction_id && setTransactionId(route.params.transaction_id);

    console.log("ROUTE PARAMS", route.params);
  }, [route.params]);

  useEffect(() => {
    handleRefresh();
  }, [transactionId]);

  // Vars
  const handleRefresh = async () => {
    setIsLoading(true);

    await retrieveTransactionDetail();

    setIsLoading(false);
  };

  const retrieveTransactionDetail = async () => {
    setTransaction(state => ({
      ...state,
      modelLoaded: false,
      model: null
    }));

    return httpService('/api/transaction/transaction', {
      data: {
        act: 'TrxDetail',
        dt: JSON.stringify({ idtrx : route.params.transaksi.orderno }),
      }
    }).then(({ status, data }) => {
      setTransaction(state => ({
        ...state,
        model: 200 !== status ? null : data.find((item: TransactionModel) => item.id === transactionId),
        modelLoaded: true
      }));

      // if (!user?.orderfirst && data?.length) {
      //   const orderfirst = data.find((item: TransactionModel) => (
      //     item.orderstatus === 'belumbayar'
      //   ))?.ordertgl || '';

      //   orderfirst && httpService.setUser({
      //     ...user,
      //     orderfirst
      //   });
      // }
    }).catch((err) => {
      ToastAndroid.show(t(`Transaksi belum dapat ditampilkan.`), ToastAndroid.SHORT);
    });
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={(
        <RefreshControl
          refreshing={isLoading}
          onRefresh={handleRefresh}
          colors={[colors.palettes.primary]}
        />
      )}
    >
      {/* {!transaction.modelLoaded ? (
        <View style={{ paddingTop: 8 }}>
          <BoxLoading width={[120, 180]} height={20} />
          <BoxLoading width={[180, 280]} height={18} style={{ marginTop: 8 }} />
          <BoxLoading width={[180, 280]} height={18} style={{ marginTop: 4 }} />
          <BoxLoading width={[120, 160]} height={18} style={{ marginTop: 4 }} />
        </View>
      ) : (
        !transaction.model ? (
          <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            marginVertical: 8
          }}>
            <Typography textAlign="center">
              {t(`Transaksi tidak dapat ditemukan`)}
            </Typography>

            <Button
              containerStyle={{ marginTop: 12 }}
              label={t(`Back`)}
              border
              onPress={() => navigation.navigatePath('Public', {
                screen: 'BottomTabs.NotificationStack.TransactionList'
              })}
            />
          </View>
        ) : (
          <TransactionItem
            transaction={transaction.model}
          />
        )
      )} */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 15,
    paddingTop: 16,
    paddingBottom: 24,
    backgroundColor: colors.white,
  },
});

export default TransactionDetail;
