import { useRoute } from '@react-navigation/core';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ListRenderItemInfo, ScrollView, StyleSheet, useWindowDimensions, View, Image } from 'react-native';
import { colors, shadows, wrapper } from '../../../lib/styles';
import { useAppNavigation } from '../../../router/RootNavigation';
import { Typography, PressableBox, Button } from '../../../ui-shared/components';
import { useTranslation } from 'react-i18next';
import { Modelable, TransactionModel, UserModel } from '../../../types/model';
import TransactionItem from '../../components/TransactionItem';
import TransactionStatusModal from '../../components/TransactionStatusModal';
import TransactionPayModal from '../../components/TransactionPayModal';
import { httpService } from '../../../lib/utilities';
import { useAppSelector } from '../../../redux/hooks';
import ViewCollapse from '../../components/ViewCollapse';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { BoxLoading } from '../../../ui-shared/loadings';
import { FlatList } from 'react-native-gesture-handler';

function TransactionUsers() {
  // Hooks
  const navigation = useAppNavigation();
  const route = useRoute();
  const { width, height } = useWindowDimensions();
  const { t } = useTranslation('notification');
  // States
  const [isLoading, setIsLoading] = useState(false);
  const { user: { user } } = useAppSelector((state) => state);
  const [users, setUsers] = useState<Modelable<UserModel>>({
    model: null,
    modelsLoaded: false,
  });

  useEffect(() => {
    handleRefresh();
  }, []);

  // Vars
  const handleRefresh = async () => {
    setIsLoading(true);

    retrieveCustomerTransaction();

    setIsLoading(false);
  };

  const retrieveCustomerTransaction = async (users: UserModel) => {
    return httpService(`/api/transaction/transaction`, {
      data: {
        act: 'TrxUsers',
        dt: JSON.stringify({ email: user?.email }),
      },
    }).then(({ status, data }) => {
      setUsers(state => ({
        ...state,
        models: 200 !== status ? [] : (data || []),
        modelsLoaded: true
      }));
    }).catch(() => {
      setUsers(state => ({ ...state, modelsLoaded: true }));
    });
  };

  const handleGoToTrxDetail = (users: UserModel) => {
    if (!users.kd_customer) {
      return void(0);
    }

    navigation.navigatePath('Public', {
      screen: 'BottomTabs.NotificationStack.TransactionList',
      params: [null, null, {
        userID: users.kd_customer,
        users,
      }]
    });

    // console.log('NAMA USER___'+users.nm_lengkap);
  };

  const renderUsers = ({ item, index }: ListRenderItemInfo<UserModel>) => {
    return (
      <ScrollView
        style={{ flexGrow: 1, paddingHorizontal: 15, backgroundColor: colors.white }}
        refreshControl={(
          <RefreshControl
            refreshing={false}
            onRefresh={handleRefresh}
            colors={[colors.palettes.primary]}
          />
        )}>
        <PressableBox
          key={index}
          containerStyle={{
            marginHorizontal: 0,
            marginVertical: 5,
            borderWidth: 1, 
            borderRadius: 5, 
            borderColor: '#ccc'
          }}
          style={styles.menuChildBtn}
          onPress={() => handleGoToTrxDetail(item)}>

          <View style={{ flex: 1,}}>
            <View style={[wrapper.row, { flex: 1, paddingHorizontal: 10, width: '100%', }]}>
              <Typography style={{ fontSize: 12, flex: 2, fontWeight: 'bold' }}>
                {item.nm_customer}
              </Typography>
              <Typography style={{ fontSize: 10, color: '#333' }}>
                Lihat transaksi <Ionicons name="chevron-forward" size={10} color={'black'} />
              </Typography>
            </View>
            <View style={[wrapper.row, { marginTop: 5, paddingHorizontal: 10, width: '100%' }]}>
              {item.no_card == null ? (
                <Typography style={{ textAlign: 'center', fontSize: 10, paddingHorizontal: 3, color: '#ec3a3b' }}>
                  BELUM MENJADI MEMBER
                </Typography>
              ) : (
                <>
                  <View style={{ flex: 2 }}>
                    <Image source={require('../../../assets/icons/figma/membercard.png')} style={styles.avatarVIP} />
                    <Typography style={{ textAlign: 'center', fontSize: 12 }}>
                      VIP MEMBER
                    </Typography>
                  </View>
                  <View style={{ flex: 1 }}>
                  <View style={{ width: 0.5, height: 50, alignSelf: 'center', marginVertical: 10, backgroundColor: '#333' }} />
                  </View>
                  <View style={{ flex: 2 }}>
                    <Image source={require('../../../assets/icons/figma/coin.png')} style={styles.avatarCoin} />
                    <Typography style={{ textAlign: 'center', fontSize: 12, fontWeight: 'bold' }}>
                      {item.saldo}
                    </Typography>
                  </View>
                </>
              )}
            </View>
          </View>
        </PressableBox>
      </ScrollView>
    )
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FEFEFE' }}>
      <View style={[wrapper.row, { backgroundColor: '#FEFEFE' }]}>
        <PressableBox
            opacity
            style={{ alignItems: 'center', }}
            onPress={() => navigation.navigatePath('Public', {
                screen: 'BottomTabs.AccountStack.Account'
            })}>
            <Typography color="black" style={{ marginVertical: 20, marginHorizontal: 15 }}>
              <Ionicons name="arrow-back" size={18} color={colors.gray[900]} /> {`${''}Transaksi Pelanggan`}
            </Typography>
        </PressableBox>
      </View>
      <Typography textAlign="center" style={{ paddingVertical: 12, fontSize: 11, backgroundColor: '#FEFEFE' }}>
        {t(`Klik nama dibawah untuk melihat detail transaksi.`)}
      </Typography>
      <FlatList
        refreshControl={(
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            colors={[colors.palettes.primary]}
          />
        )}
        data={users.models}
        renderItem={renderUsers}
        ListEmptyComponent={!users.modelsLoaded ? (
          <View style={[styles.PromotionCardContainer, { marginTop: 8 }]}>
            <View style={styles.articleCard}>
              <View style={{ flex: 1, paddingLeft: 12 }}>
                <BoxLoading width={[100, 150]} height={20} />

                <BoxLoading width={[140, 200]} height={18} style={{ marginTop: 6 }} />
                <BoxLoading width={[100, 130]} height={18} style={{ marginTop: 2 }} />
              </View>
            </View>
          </View>
        ) : (
          <View style={{ marginTop: 15 }}>
            <Typography textAlign="center">
              {t(`${''}Data tidak ditemukan dan anda belum pernah melakukan transaksi.`)}
            </Typography>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 15,
    paddingTop: 12,
    paddingBottom: 24,
    backgroundColor: colors.white,
  },
  menuBtnContainer: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
  },
  actionBtnContainer: {
    ...shadows[3],
    backgroundColor: colors.white,
    borderRadius: 5,
    marginVertical: 5,
  },
  header: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: colors.white,
  },
  menuChildBtn: {
    ...wrapper.row,
    alignItems: 'center',
    paddingVertical: 6,
  },
  PromotionCardContainer: {
    marginHorizontal: 0,
    borderRadius: 12,
    backgroundColor: colors.white,
  },
  articleCard: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginVertical: 5,
    backgroundColor: '#FEFEFE',
    borderWidth: 2,
    borderColor: '#F3F3F3',
    borderRadius: 5,
  },
  menuChildIcon: {
    width: 24,
    alignItems: 'center',
  },
  avatarVIP: {
    width: 50,
    height: 30,
    marginTop: 10,
    alignSelf: 'center',
    borderRadius: 3,
  },
  avatarCoin: {
    width: 30,
    height: 30,
    marginTop: 10,
    alignSelf: 'center'
  },
});

export default TransactionUsers;
