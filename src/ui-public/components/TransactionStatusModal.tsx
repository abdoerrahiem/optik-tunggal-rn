import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, ListRenderItemInfo, StyleSheet, View } from 'react-native';
import { colors, wrapper } from '../../lib/styles';
import { httpService } from '../../lib/utilities';
import { Modelable, TransactionLog, TransactionModel } from '../../types/model';
import { BottomDrawer, BottomDrawerProps, Typography } from '../../ui-shared/components';
import { BoxLoading } from '../../ui-shared/loadings';

type Props = BottomDrawerProps & {
  transaction?: TransactionModel;
};

function TransactionStatusModal({
  isVisible,
  transaction,
  ...props
}: Props) {
  // Hooks
  const { t } = useTranslation('notification');

  // States
  const [log, setLog] = useState<Modelable<TransactionLog>>({
    models: [],
    modelsLoaded: false,
  });

  // Effects
  useEffect(() => {
    if (isVisible && !transaction?.logs?.length) {
      retrieveTransactionStatus();
    } else if (transaction?.logs?.length) {
      setLog(state => ({
        ...state,
        models: transaction?.logs,
        modelsLoaded: true,
      }));
    } else if (!isVisible) {
      setLog(state => ({
        ...state,
        models: [],
        modelsLoaded: false,
      }));
    }
  }, [isVisible]);

  // Vars
  const retrieveTransactionStatus = async () => {
    setLog(state => ({ ...state, modelsLoaded: false }));

    return httpService('/api/transaction/transaction', {
      data: {
        act: 'TrxListItem',
        // dt: JSON.stringify({ comp: '001', id: transaction?.id }),
      }
    }).then(({ status, data, item, shipTo }) => {
      const models: TransactionLog[] = convertToLogs(data || {});

      setLog(state => ({
        ...state,
        modelsLoaded: true,
        models: 200 !== status ? [] : models,
      }));
    }).catch(() => {
      setLog(state => ({
        ...state,
        modelsLoaded: true,
      }));
    });
  };

  const convertToLogs = (data: TransactionModel): TransactionLog[] => {
    const logs: TransactionLog[] = [];

    if (data.ordertgl) {
      logs.push({
        date: moment(data.ordertgl, 'YYYYMMDD').format('YYYY-MM-DD'),
        description: t(`Pemesanan dibuat`)
      });
    }

    // if (data.buktibayartgl) {
    //   logs.push({
    //     date: moment(data.buktibayartgl, 'YYYYMMDD').format('YYYY-MM-DD'),
    //     time: data.buktibayarjam,
    //     description: t(`Bukti pembayaran dikirim`)
    //   });
    // }

    // if (data.verifybayartgl) {
    //   logs.push({
    //     date: moment(data.verifybayartgl, 'YYYYMMDD').format('YYYY-MM-DD'),
    //     time: data.verifybayarjam,
    //     description: t(`Pembayaran sudah diverifikasi\nPembayaran sudah diterima`),
    //   });
    // }

    // if (data.dotgl) {
    //   logs.push({
    //     date: moment(data.dotgl, 'YYYYMMDD').format('YYYY-MM-DD'),
    //     time: data.dojam,
    //     description: t(`Barang sedang dikirim`),
    //   });
    // }

    // if (data.kirimtgl) {
    //   logs.push({
    //     date: moment(data.kirimjam, 'YYYYMMDD').format('YYYY-MM-DD'),
    //     time: data.kirimjam,
    //     description: t(`Barang sampai di tujuan`)
    //   });
    // }

    // if (data.terimatgl) {
    //   logs.push({
    //     date: moment(data.terimatgl, 'YYYYMMDD').format('YYYY-MM-DD'),
    //     time: data.terimajam,
    //     description: t(`Barang diterima`)
    //   });
    // }

    return logs;
  };

  const renderLogs = ({ item, index }: ListRenderItemInfo<TransactionLog>) => {
    const date = moment(item.date);
    const isCurrent = index + 1 === log.models?.length;

    return (
      <View key={index} style={styles.logRow}>
        <View style={styles.logCircleLine}>
          <View style={[styles.logCircle, !isCurrent ? null : styles.logCircleCurrent]} />

          {index === 0 ? null : (
            <View style={styles.logLine} />
          )}
        </View>

        <View style={{ flex: 1, marginHorizontal: 15, paddingBottom: 16 }}>
          <Typography color={800}>
            {date.format('D MMM YYYY')}
          </Typography>

          <Typography style={{ marginTop: 4 }}>
            {item.description}
          </Typography>
        </View>

        <Typography size="sm" textAlign="right" style={{ paddingVertical: 4, minWidth: 48 }}>
          {/* {item.time} */}
        </Typography>
      </View>
    );
  };

  return (
    <BottomDrawer
      isVisible={isVisible}
      title={t(`Detail Status Pemesanan`)}
      titleProps={{ textAlign: 'center', color: 'primary' }}
      {...props}
    >
      <FlatList
        contentContainerStyle={styles.container}
        style={{ flexDirection: 'column-reverse' }}
        data={log.models}
        renderItem={renderLogs}
        ListEmptyComponent={!log.modelsLoaded ? (
          <View style={styles.logRow}>
            <View style={styles.logCircleLine}>
              <View style={[styles.logCircle, { backgroundColor: colors.gray[400]}]} />
            </View>

            <View style={{ flex: 1, marginHorizontal: 15, paddingBottom: 16 }}>
              <BoxLoading width={[70, 90]} height={18} />

              <BoxLoading width={[180, 220]} height={18} style={{ marginTop: 4 }} />
            </View>
          </View>
        ) : (
          <Typography textAlign="center" style={{ paddingVertical: 12 }}>
            {t(`Belum ada riwayat status pemesanan.`)}
          </Typography>
        )}
      />
    </BottomDrawer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 12,
    paddingBottom: 24,
    paddingHorizontal: 15,
    flexDirection: 'column-reverse'
  },

  logRow: {
    ...wrapper.row,
    alignItems: 'flex-start',
  },
  logCircleLine: {
    width: 40,
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  logCircle: {
    marginTop: 2,
    width: 16,
    height: 16,
    borderRadius: 16,
    backgroundColor: colors.gray[600]
  },
  logCircleCurrent: {
    backgroundColor: colors.palettes.green,
  },
  logLine: {
    width: 1,
    marginBottom: -2,
    flex: 1,
    backgroundColor: colors.gray[600],
  },
  logLineCurrent: {
    backgroundColor: colors.palettes.green,
  },
});

export default TransactionStatusModal;
