import React, { useCallback, useEffect, useState } from 'react';
import { Image, Linking, Platform, StatusBar, StyleSheet, useWindowDimensions, View, Alert, RefreshControl, Dimensions } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { colors, shadows, wrapper } from '../../lib/styles';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { useAppNavigation } from '../../router/RootNavigation';
import { BottomDrawer, Button, Header, PressableBox, Typography } from '../../ui-shared/components';
import AccountBanner from '../components/AccountBanner';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { httpService, Storage, showPhone } from '../../lib/utilities';
import LanguageModal from '../components/LanguageModal';
import { useTranslation } from 'react-i18next';
import ViewCollapse from '../components/ViewCollapse';
import { FigmaIcon } from '../../assets/icons';
import { useRoute } from '@react-navigation/core';
import { SafeAreaView } from 'react-native-safe-area-context';
import { setCartItems, setFavorites } from '../../redux/actions';
import moment from 'moment';
import TextTicker from 'react-native-text-ticker';
import DeviceInfo from 'react-native-device-info';

function Account() {
  // Hooks
  const navigation = useAppNavigation();
  const route = useRoute();
  const { user: { user }, ui: { lang } } = useAppSelector((state) => state);
  const { t } = useTranslation('account');
  const { height } = useWindowDimensions();
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

  // States
  const [options, setOptions] = useState({
    authModalOpen: false,
    langModalOpen: false,
    termsUrl: '',
    privacyUrl: '',
    versionUrl: '',
    faqUrl: '',
  });

  useEffect(() => {
    handleRefresh();
  }, []);

  // Effects
  useEffect(() => {
    handleVersionCheck();
  }, []);
  
  useEffect(() => {
    const unsubscribeFocus = navigation.addListener('focus' as any, () => {
      handleModalToggle('auth', !user);
    });

    const unsubscribeBlur = navigation.addListener('blur' as any, () => {
      handleModalToggle('auth', false);
    });

    if (user) {
      unsubscribeFocus();
      unsubscribeBlur();
    }
    
    handleModalToggle('auth', !user);

    return () => {
      unsubscribeFocus();
      unsubscribeBlur();
    };
  }, [user]);

  const handleRefresh = async () => {
    setIsLoading(true);
    await renderLogin();
    setIsLoading(false);
  };

  const renderLogin = async () => {
    setIsLoading(true);
    return httpService('/api/login/login', {
      data: {
        act: 'Login',
        dt: JSON.stringify({
          LoginID: user?.email,
          LoginPwd: null,
        }),
      }
    }).then(({ status, data, token }) => {
      setIsLoading(false);
      if (status == 200) {
        httpService.setUser({
          ...data,
          ...(!token ? null : { token }),
          status: '1',
        });
      }
    })
  }

  // Vars
  const handleVersionCheck = async () => {
    let isValid = true;
    await httpService(`/version.json`, {
      method: 'get'
    }).then(({
      terms_ios, privacy_ios, link_ios,
      terms_android, privacy_android, link_android, faq_ios, faq_android,
    }) => {
      let termsUrl = '';
      let privacyUrl = '';
      let versionUrl = '';
      let faqUrl= '';

      switch (Platform.OS) {
        case 'ios':
          termsUrl = terms_ios;
          privacyUrl = privacy_ios;
          versionUrl = link_ios;
          faqUrl  = faq_ios;
          break;
        case 'android':
          termsUrl = terms_android;
          privacyUrl = privacy_android;
          versionUrl = link_android;
          faqUrl  = faq_android;
          break;
      }

      setOptions(state => ({
        ...state,
        termsUrl,
        privacyUrl,
        versionUrl,
        faqUrl
      }));
    }).catch(() => void (0));

    return isValid;
  };

  const handleLogout = async () => {
    // await dispatch(setCartItems([]));
    // await dispatch(setFavorites([]));

    await httpService.logout();

    navigation.reset({
      index: 0,
      routes: [{
        name: 'Public',
        params: { screen: 'BottomTabs' }
      }],
    });
  };

  const handleModalToggle = (type: string, open: boolean | null = null) => {
    switch (type) {
      case 'lang':
        setOptions(state => ({
          ...state,
          langModalOpen: 'boolean' === typeof open ? open : !options.langModalOpen,
        }))
        break;
      case 'auth':
        setOptions(state => ({
          ...state,
          authModalOpen: 'boolean' === typeof open ? open : !options.authModalOpen,
        }))
        break;
    }
  };

  const renderLangBtn = () => {
    return (
      <Button
        containerStyle={{ marginLeft: 12 }}
        size={42}
        label={lang.toUpperCase()}
        labelProps={{ color: 900, size: 'lg' }}
        onPress={() => setOptions(state => ({ ...state, langModalOpen: true }))}
      />
    );
  };

  const renderUnauthenticated = () => {
    return (
      <View style={{ flex: 1, position: 'relative' }}>

        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.wrapper}>
            <AccountBanner />
          </View>
        </SafeAreaView>
      </View>
    );
  };

  return (
    <>
      {!user ? renderUnauthenticated() : (
        <View style={{ flex: 1 }}>
          <Header
            title={t(`${''}Pengaturan`)}
          />

          <ScrollView
            contentContainerStyle={[styles.wrapper, styles.container]}
            refreshControl={(
              <RefreshControl
                refreshing={isLoading}
                onRefresh={handleRefresh}
                colors={[colors.palettes.primary]}
              />
            )}
          >
            
              <View style={styles.accountCard}>                 
                <View style={{marginTop: 20}}>
                  <View style={[wrapper.row]}>
                    <View style={styles.avatar}>
                      {!user.foto ? <Image source={{ uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQTdmrjoiXGVFEcd1cX9Arb1itXTr2u8EKNpw&usqp=CAU' }} style={styles.avatar} /> : (
                        <Image source={{ uri: user.foto }} style={styles.avatar}/>
                      )}
                    </View>
                    <View style={{marginVertical: 10, flex: 1}}>
                      <Typography style={{ color: '#0d674e', fontSize: 14}} >
                        {`${user?.namadepan || user?.name}  ${user?.namatengah == null ? "" : user?.namatengah} ${user?.namabelakang}`}{`\n`}
                        {`${user?.id}`}
                        {/* {showPhone(String(user.hp), '0')} */}
                      </Typography>
                      <Typography 
                        size='sm'
                        style={{
                            color: user?.no_card == null ? 'red' : '#0d674e',
                            borderRadius: 10, textAlignVertical: 'center'}}>
                        {user?.no_card == null ? `Bukan member` : `Member`}
                      </Typography>
                    </View>
                    <View style={{alignContent: 'flex-end', marginHorizontal: 10, marginVertical: 5}}>
                      <PressableBox
                        containerStyle={{ marginTop: 1, height: 50}}
                        onPress={() => navigation.navigatePath('Public', {
                          screen: 'BottomTabs.AccountStack.ProfileEdit',
                          params: [null, null, {
                            email: user.email,
                          }]
                        })}>
                        <Ionicons name="settings-outline" size={24} color={'#0d674e'} />
                      </PressableBox>
                    </View>
                  </View>
                </View>
                {user?.tgllahir == null ? 
                  (
                    <View style={[wrapper.row, { marginTop: 10}]}>
                      <Ionicons name='notifications-outline' size={12} color={'red'} style={{alignSelf: 'center', marginHorizontal: 5}}/>
                      <TextTicker
                        style={{ fontSize: 12, color: 'red', paddingHorizontal: 5, paddingVertical: 7 }}
                        duration={3000}
                        loop
                        repeatSpacer={50}
                        marqueeDelay={1000}
                      >
                        Untuk mempermudah transaksi, Silahkan lengkapi profile anda.
                      </TextTicker>
                    </View>
                  )
                  : null }
                <View style={{ marginTop: 5 }}>
                  <ViewCollapse
                    style={styles.menuContainer}
                    pressableProps={{
                      containerStyle: styles.menuBtnContainer,
                    }}
                    header={t(`${''}Transaksi`)}
                    headerProps={{
                      type: 'h',
                    }}
                    collapse
                  >
                    {[
                      {
                        title: t(`${''}Transaksi Saya`),
                        subtitle: t(`${''}List transaksi anda.`),
                        Icon: FigmaIcon.FigmaDownload,
                        navigatePath: () => {
                          navigation.navigatePath('Public', {
                            screen: 'TransactionList',
                            params: [null, {
                              initial: false,
                            }]
                          });
                        },
                      },
                      {
                        title: t(`${''}Favorit Saya`),
                        subtitle: t(`${''}Produk yang anda sukai.`),
                        Icon: FigmaIcon.Figmawishlist,
                        navigatePath: () => {
                          navigation.navigatePath('Public', {
                            screen: 'Favorite',
                          });
                        },
                      },
                    ].map((item, index) => (
                      <PressableBox
                        key={index}
                        containerStyle={{
                          marginTop: index === 0 ? 8 : 4,
                          borderRadius: 5,
                          marginHorizontal: 0,
                        }}
                        style={styles.menuChildBtn}
                        onPress={!item.navigatePath ? undefined : (
                          () => {
                            if ('function' === typeof item.navigatePath) {
                              return item.navigatePath();
                            }
                            
                            navigation.navigatePath('Public', {
                              screen: item.navigatePath
                            });
                        })}
                      >
                        <View style={[wrapper.row, { flex: 1, marginVertical: 5 }]}>
                          <Typography size='sm' style={{flex: 1}}>
                            {item.title}
                          </Typography>
                          <Ionicons name="chevron-forward" size={16} color={'#0d674e'} style={{alignSelf: 'flex-end'}}/>
                        </View>
                      </PressableBox>
                    ))}
                  </ViewCollapse>
                </View>

                <View style={{ marginTop: 2 }}>
                  <ViewCollapse
                    style={styles.menuContainer}
                    pressableProps={{
                      containerStyle: styles.menuBtnContainer,
                    }}
                    header={t(`${''}Pengaturan akun`)}
                    headerProps={{
                      type: 'h',
                      // style: { paddingLeft: 24 + 15 }
                    }}
                    collapse
                  >
                    {[
                      // {
                      //   title: t(`${''}Daftar Transaksi`),
                      //   subtitle: t(`${''}Transaksi yang pernah anda lakukan.`),
                      //   Icon: FigmaIcon.FigmaDownload,
                      //   navigatePath: () => {
                      //     navigation.navigatePath('Public', {
                      //       screen: 'BottomTabs.NotificationStack.TransactionList',
                      //       params: [null, {
                      //         initial: false,
                      //       }]
                      //     });
                      //   },
                      // },
                      // {
                      //   title: t(`${''}Keranjang`),
                      //   subtitle: t(`${''}Daftar produk yg ditambahkan ke keranjang belanja`),
                      //   Icon: FigmaIcon.FigmaCartIn,
                      //   navigatePath: () => {
                      //     navigation.navigatePath('Public', {
                      //       screen: 'BottomTabs.CartStack.Cart',
                      //       params: [null, {
                      //         initial: false,
                      //       }]
                      //     });
                      //   },
                      // },
                      // {
                      //   title: t(`${''}Ulasan`),
                      //   subtitle: t(`${''}Daftar ulasan produk yg sudah dibeli`),
                      //   Icon: FigmaIcon.FigmaDocument,
                      //   navigatePath: 'BottomTabs.AccountStack.ReviewList',
                      // },
                      {
                        title: t(`${''}Alamat Pengiriman`),
                        subtitle: t(`${''}Atur alamat pengiriman`),
                        Icon: FigmaIcon.FigmaHomeFilled,
                        navigatePath: () => {
                          navigation.navigatePath('Public', {
                            screen: 'AddressList',
                            params: { flaq: 'refresh' }
                          });
                        },
                      },
                      {
                        title: t(`${''}Akun & Keamanan`),
                        subtitle: t(`${''}Tingkatkan keamanan akun anda.`),
                        Icon: FigmaIcon.FigmaLock,
                        navigatePath: 'BottomTabs.AccountStack.PasswordReset',
                      },

                      {
                        title: t(`${''}Hubungi kami`),
                        Icon: FigmaIcon.FigmaContact,
                        subtitle: t(`${''}Kami senang membantu anda.`),
                        navigatePath: 'Contact',
                      },
                    ].map((item, index) => (
                      <PressableBox
                        key={index}
                        containerStyle={{
                          marginTop: index === 0 ? 8 : 4,
                          borderRadius: 15,
                          marginHorizontal: 0,
                        }}
                        style={styles.menuChildBtn}
                        onPress={!item.navigatePath ? undefined : (
                          () => {
                            if ('function' === typeof item.navigatePath) {
                              return item.navigatePath();
                            }
                            
                            navigation.navigatePath('Public', {
                              screen: item.navigatePath
                            });
                        })}
                      >
                        <View style={styles.menuChildIcon}>
                          {!item.Icon ? null : (
                            <item.Icon width={18} height={18} color={colors.gray[900]} />
                          )}
                        </View>

                        <View style={{ flex: 1, paddingLeft: 15 }}>
                          <Typography size='sm' style={{fontWeight: '700'}}>
                            {item.title}
                          </Typography>

                          <Typography size="sm" color={800} style={{ marginTop: 2 }}>
                            {item.subtitle}
                          </Typography>
                        </View>
                      </PressableBox>
                    ))}
                  </ViewCollapse>
                </View>

                <View style={{ marginTop: 0 }}>
                  <ViewCollapse
                    style={styles.menuContainer}
                    pressableProps={{
                      containerStyle: styles.menuBtnContainer,
                    }}
                    header={t(`${''}Informasi lain `)}
                    headerProps={{
                      type: 'h',
                      // style: { paddingLeft: 24 + 15 }
                    }}
                    collapse
                  >
                    {[
                      {
                        title: t(`${''}Syarat & Ketentuan`),
                        navigatePath: 'Terms',
                        url: options.termsUrl,
                        Icon: FigmaIcon.FigmaHomeFilled,
                      },
                      // {
                      //   title: t(`${''}FAQ`),
                      //   navigatePath: 'FAQ',
                      //   url: options.faqUrl,                    
                      // },
                      {
                        title: t(`${''}Kebijakan Privasi`),
                        navigatePath: 'PrivacyPolicy',
                        url: options.privacyUrl,
                      },
                      {
                        title: t(`${''}Beri Kami Penilaian`),
                        navigatePath: 'BottomTabs.AccountStack.Account',
                        url: options.versionUrl,
                      },
                    ].map((item, index) => (
                      <PressableBox
                        key={index}
                        containerStyle={{
                          marginTop: index === 0 ? 4 : 4,
                          borderRadius: 5,
                          marginHorizontal: 0,
                        }}
                        style={[styles.menuChildBtn, { paddingVertical: 5 }]}
                        onPress={!item.url ? undefined : () => Linking.openURL(item.url)}
                      >
                        <View style={{ flex: 1, marginVertical: 5 }}>
                          <Typography size='sm'>
                            {item.title}
                          </Typography>
                        </View>
                      </PressableBox>
                    ))}
                  </ViewCollapse>
                </View>
                <Typography size='xs' style={{marginVertical: 30, textAlign: 'center'}}>Versi {DeviceInfo.getVersion()}</Typography>
                <View style={{ paddingBottom: 15 }}>
                  <Button
                    containerStyle={[styles.menuBtnContainer, {
                      flex: 1,
                      borderBottomWidth: 0
                    }]}
                    style={{ paddingHorizontal: 15, paddingVertical: 10, backgroundColor: '#a94442' }}
                    label={`${''}Keluar`}
                    labelStyle={{
                      textAlign: 'center',
                      color: 'white'
                    }}
                    rounded={4}
                    onPress={() => Alert.alert(
                      `${t('Keluar')}`,
                      `${t('Yakin mau keluar akun?')}`,
                      [
                        {
                          text: `${t('Batal')}`,
                        },
                        {
                          text: `${t('Iya')}`,
                          onPress: () => handleLogout(),
                        }
                      ]
                    )}
                  />
                </View>
              </View>
          </ScrollView>
        </View>
      )}

      {/* Lang Modal */}
      <LanguageModal
        isVisible={options.langModalOpen}
        onSwipeComplete={() => handleModalToggle('lang', false)}
        onBackButtonPress={() => handleModalToggle('lang', false)}
        onBackdropPress={() => handleModalToggle('lang', false)}
        onSelected={() => handleModalToggle('lang', false)}
      />

      {/* Register Modal */}
      <BottomDrawer
        isVisible={options.authModalOpen}
        swipeDirection={null}
        onBackButtonPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigatePath('Public', {
          screen: 'BottomTabs.HomeStack.Home',
        })}
        style={{
          paddingTop: 0,
          paddingBottom: 0,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          height
        }}
      >
        {renderUnauthenticated()}
      </BottomDrawer>
    </>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexGrow: 1,
  },
  container: {
    backgroundColor: '#0d674e'
  },

  accountCard: {
    flex: 1,
    backgroundColor: colors.white,
    paddingVertical: 16,
    paddingHorizontal: 15,
    marginTop: -20,
  },
  avatarVIP: {
    width: 30,
    height: 30,
    marginHorizontal: 15,
  },
  avatar: {
    alignSelf: 'center',
    width: 60,
    height: 60,
    borderRadius: 128,
    borderColor: '#0d674e',
    borderWidth: 1,
    resizeMode: 'cover',
    marginHorizontal: 10
  },
  cardMember: {
    marginTop: 20, 
    borderColor: '#333', 
    backgroundColor:'#D0A92C',
    borderWidth:0,
    borderRadius:20, height: 200, width: '100%',
    ...shadows[5]
  },
  menuContainer: {
    margin: -15,
    padding: 15,
  },
  menuBtnContainer: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderColor: '#0d674e',
  },
  menuChildBtn: {
    ...wrapper.row,
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 15,
  },
  menuChildIcon: {
    width: 24,
    alignItems: 'center',
  }
});

export default Account;
