import { RouteProp, useRoute } from '@react-navigation/core';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, ScrollView, StyleSheet, useWindowDimensions, ToastAndroid, View } from 'react-native';
import { colors, shadows, wrapper } from '../../../lib/styles';
import { PublicAccountStackParamList } from '../../../router/publicBottomTabs';
import { useAppNavigation } from '../../../router/RootNavigation';
import { AddressModel, Modelable } from '../../../types/model';
import { Button, Header, PressableBox, Typography } from '../../../ui-shared/components';
import { BoxLoading } from '../../../ui-shared/loadings';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { RootStackParamList } from '../../../router/Router';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../../redux/hooks';
import { fetchAddresses } from '../../../redux/actions';
import { useTranslation } from 'react-i18next';
import { httpService, showPhone } from '../../../lib/utilities';
import { Image } from 'react-native-animatable';

type ActionScreenState = {
  rootScreen?: keyof RootStackParamList;
  screenPath?: string;
};

function AddressList() {
  // Hooks
  const navigation = useAppNavigation();
  const route = useRoute<RouteProp<PublicAccountStackParamList, 'AddressList'>>();
  const { width } = useWindowDimensions();
  const dispatch = useDispatch();
  const { user: { user, location, address: addressState } } = useAppSelector((state) => state);
  const { t } = useTranslation('account');

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [address, setAddress] = useState<Modelable<AddressModel>>({
    models: [],
    modelLoaded: false,
  });
  const [actionScreen, setActionScreen] = useState<ActionScreenState>({
    rootScreen: undefined,
    screenPath: undefined,
  });
  const [options, setOptions] = useState({
    selected: -1,
  });

  // Effects
  useEffect(() => {
    dispatch(fetchAddresses())
  }, []);

  useEffect(() => {
    const { action_screen, refresh } = route.params;

    if (action_screen) {
      const [rootScreen, screenPath] = action_screen;

      setActionScreen(state => ({
        ...state,
        rootScreen,
        screenPath,
      }));
    }

    handleRefresh();
  }, [route.params]);

  useEffect(() => {
    if (addressState.modelsLoaded) {
      setAddress(state => ({
        ...state,
        models: addressState.models,
        modelsLoaded: true
      }));
    }
  }, [addressState]);

  // Vars
  const handleRefresh = async () => {
    setIsLoading(true);
    retrieveAddresses();
    setIsLoading(false);
  };

  const retrieveAddresses = async () => {
    dispatch(fetchAddresses());
  };

  const handleAddressSelect = (item: AddressModel, index: number) => {
    setOptions(state => ({
      ...state,
      selected: index,
    }));
  };

  const handleEdit = (addressItem: AddressModel) => {
    const {
      rootScreen = 'Public',
      screenPath = 'AddressForm'
    } = actionScreen;
    const paths = (screenPath)?.split('.') || [];

    if (rootScreen) {
      navigation.navigatePath(rootScreen, {
        screen: screenPath,
        params: paths.map((item, index) => {
          return index + 1 !== paths?.length ? null : {
            address: addressItem,           
          };
        }),
      });
    }
  };

  const handleSubmit = (addressItem: AddressModel) => {
    const { rootScreen, screenPath } = actionScreen;
    const paths = screenPath?.split('.') || [];

    if (rootScreen) {
      navigation.navigatePath(rootScreen, {
        screen: screenPath,
        params: paths.map((item, index) => {
          return index + 1 !== paths?.length ? null : {
            address: addressItem,
          };
        }),
      });
    }
  };

  const handleDelete = async (addressItem: AddressModel) => {
    return httpService('/api/login/login', {
      data: {
        act: 'DeleteShipList',
        dt: JSON.stringify({
          addressid: addressItem.id
        }),
      }
    }).then(async ({ status, id = 1 }) => {
      console.log("ADDRESS REMOVED", status, id);

      if (status === 200) {
        handleRefresh();
      }
    }).catch(err => {
      console.error("Register FAILED", err);
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <Header
        left
        title={t(`Alamat Pengiriman`)}
      />
      {/* {!actionScreen.rootScreen ? null : ( */}
        <View style={[styles.wrapper, { paddingVertical: 5 }]}>
          <View style={[wrapper.row]}>
            <Typography style={{fontSize: 10, flex: 1, paddingVertical: 10, paddingRight: 15}}>Alamat akan digunakan untuk pengiriman pesanan.</Typography>
            <PressableBox
              style={{ backgroundColor: '#0d674e', borderRadius: 5, marginTop: 10, width: 120, alignSelf: 'flex-end' }}
              onPress={() => navigation.navigatePath('Public', {
                // screen: 'BottomTabs.AccountStack.AddressEdit',
                screen: 'AddressForm',
              })}
            >
              <Typography style={{
                fontSize: 10,
                color: 'white',
                alignSelf: 'center',
                paddingVertical: 10
              }}>
                <Ionicons name="location" size={10} color="#fff" /> 
                {t(`Tambah Alamat`)}
              </Typography>
            </PressableBox>
          </View>
        </View>
      {/* )} */}
      <PressableBox
        style={{backgroundColor: '#fff'}}
        onPress={() => handleRefresh()}>
          <Typography size='xxs' style={{textAlign: 'center', marginVertical: 10, color: 'blue'}}>
            <Ionicons name="refresh" size={14} color="blue" /> 
            Klik untuk refresh / tarik layar dari atas ke bawah
          </Typography>
      </PressableBox>
      {!address.modelsLoaded ? (
        <View style={styles.contentSection}>
          <BoxLoading width={[320, 320]} height={100} style={{alignSelf: 'center', marginVertical: 5}}/>
          <BoxLoading width={[320, 320]} height={100} style={{alignSelf: 'center', marginVertical: 5}}/>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={[styles.container, styles.wrapper]}
          refreshControl={(
            <RefreshControl
              refreshing={isLoading}
              onRefresh={handleRefresh}
              colors={[colors.palettes.primary]}
            />
          )}
          data={[...(address.models || [])].reverse()}
          renderItem={({ item, index }) => (
            <View
              key={index}
              style={{
                position: 'relative',
                marginTop: index === 0 ? 0 : 32,
              }}
            >
              <PressableBox
                containerStyle={styles.cardContainer}
                style={styles.card}
                onPress={() => handleAddressSelect(item, index)}
              >
                {/* {!item.title ? null : (
                  <Typography size='sm'>{item.title}</Typography>
                )} */}

                <Typography size='xs' style={{ marginTop: 4, fontWeight: '700' }}>
                  {item.vch_nama || item.nama}
                </Typography>

                <Typography size='xs' style={{ marginTop: 4 }}>
                  {showPhone(item.hp, '0')}
                </Typography>


                <Typography size='xs' style={{ marginTop: 4, textAlign: 'justify' }}>
                  Alamat : {`\n`}
                  <Typography size='xs' style={{color: item.title == 'Rumah' ? 'green' : 'blue'}}>
                    <Ionicons name="location-outline" size={12} color={item.title == 'Rumah' ? 'green' : 'blue'} /> {item.title}
                  </Typography> {`\n`}
                  {item.alamat}
                </Typography>

                {Number(item.kodepos) == 0 ? (
                  <Typography size='xs' style={{ marginTop: 4, color: 'red' }}>
                    Alamat pengiriman anda belum lengkap. silahkan ubah alamat untuk melengkapi.
                  </Typography>
                )
                : null}

                {/* {!item.lat || !item.lng ? null : (
                  <View style={[wrapper.row, { marginTop: 8, alignItems: 'center' }]}>
                    <Ionicons name="location-outline" size={20} color={colors.gray[900]} />

                    <Typography heading style={{ paddingLeft: 4 }}>
                      {t(`Sudah`)}
                    </Typography>
                  </View>
                )} */}

                {index !== options.selected || true ? null : (
                  <View style={{ position: 'absolute', top: 15, right: 15 }}>
                    <Ionicons name="checkmark" size={24} color={colors.gray[900]} />
                  </View>
                )}
              </PressableBox>

              {!!actionScreen.rootScreen ? null : (
                <Button
                  containerStyle={{
                    position: 'absolute',
                    top: 12,
                    right: 20
                  }}
                  size={24}
                  rounded
                  onPress={() => Alert.alert(
                    `${t('Hapus Alamat')}`,
                    `${t('Apakah Anda ingin menghapus alamat ini?')}`,
                    [
                      {
                        text: `${t('Batal')}`,
                      },
                      {
                        text: `${t('Hapus')}`,
                        onPress: () => handleDelete(item),
                      }
                    ]
                  )}
                >
                  <Ionicons name="trash-outline" size={18} color={colors.palettes.red} />
                </Button>
              )}

              {!actionScreen.rootScreen ? (
                <Button
                  containerStyle={styles.cardAction}
                  style={{ width: 130, backgroundColor: '#0d674e' }}
                  rounded
                  onPress={() => handleEdit(item)}
                >
                  <Typography size='xxs' style={{color: '#fff'}}>Ubah Alamat</Typography>
                </Button>
              ) : (
                <Button
                  containerStyle={styles.cardAction}
                  style={{ width: 130, backgroundColor: '#0d674e' }}
                  rounded
                  onPress={() => handleSubmit(item)}
                  >
                  <Typography size='xxs' style={{color: '#fff'}}>Pilih Alamat</Typography>
                </Button>
              )}
            </View>
          )}
          ListEmptyComponent={!address.modelsLoaded ? (
            <View style={styles.card}>
              <BoxLoading width={90} height={18} />

              <BoxLoading width={[120, 160]} height={18} style={{ marginTop: 8 }} />
              <BoxLoading width={[220, width-100]} height={18} style={{ marginTop: 4 }} />
              <BoxLoading width={[180, 240]} height={18} style={{ marginTop: 4 }} />
            </View>
          ) : (
            <View style={{ paddingVertical:  10}}>
              <Image source={{ uri: 'https://png.pngtree.com/png-vector/20190723/ourlarge/pngtree-map-location-web-icon-flat-line-filled-gray-icon-vector-png-image_1569637.jpg' }} style={styles.sorry} />
              <Typography textAlign="center">
                {t(`Belum ada alamat pengiriman.`)}
              </Typography>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingTop: 12,
    paddingBottom: 24,
  },
  wrapper: {
    paddingHorizontal: 15,
    backgroundColor: colors.white,
  },

  cardContainer: {
    backgroundColor: colors.white,
    marginHorizontal: 0,
    borderWidth: 1,
    borderColor: '#0d674e'
  },
  card: {
    position: 'relative',
    paddingTop: 8,
    paddingBottom: 28,
    paddingHorizontal: 24,
  },
  cardAction: {
    elevation: 3,
    position: 'absolute',
    alignSelf: 'flex-end',
    top: '100%',
    marginTop: -16
  },
  sorry: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginTop: 120
  },
  action: {
    marginTop: 'auto',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: colors.white
  },
  contentSection: {
    borderTopWidth: 1,
    borderTopColor: colors.gray[400],
    backgroundColor: colors.white,
    paddingTop: 10
  },
});

export default AddressList;
