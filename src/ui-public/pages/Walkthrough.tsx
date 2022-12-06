import React, { useEffect, useRef, useState, version } from 'react';
import { Alert, Image, ImageSourcePropType, Linking, ListRenderItemInfo, Platform, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Carousel from 'react-native-snap-carousel';
import { SvgProps } from 'react-native-svg';
import { WalkthroughImage } from '../../assets/images';
import { colors } from '../../lib/styles';
import { httpService, Storage } from '../../lib/utilities';
import { useAppNavigation } from '../../router/RootNavigation';
import { BottomDrawer, Button, CarouselDots, ProgressBar, Typography } from '../../ui-shared/components';
import * as Animatable from 'react-native-animatable';
import { UserModel } from '../../types/model';
import { useTranslation } from 'react-i18next';
import { setUiLang, setUserLocation } from '../../redux';
import { useDispatch } from 'react-redux';
import { default as RNSplashScreen } from 'react-native-splash-screen';
import { setCartItems } from '../../redux/actions/shopActions';
import Geolocation from '@react-native-community/geolocation';
import NetInfo from '@react-native-community/netinfo';
import axios from 'axios';
import { getConfig } from '../../lib/config';
import moment from 'moment';
import { fetchFavorites } from '../../redux/actions';
import LOGO from '../../assets/app-logo-square.png';

type SlideItem = {
  title?: string;
  caption?: string;
  bg: string; //ImageSourcePropType | React.FC<SvgProps>;
  image: ImageSourcePropType | React.FC<SvgProps>;
  action?: 'finish';
  color?: string;
  textColor?: string;
  progress?: boolean;
};

const SLIDES: SlideItem[] = [
  // {
  //   bg: 'white',
  //   image: WalkthroughImage.LogoCircle,
  //   // progress: true,
  // },
  // {
  //   // bg: require('../../assets/images/walkthrough/walk-bg-2.jpg'),
  //   bg: 'white',
  //   image: WalkthroughImage.Walk2,
  //   title: 'Memenuhi kebutuhan penglihatan anda',
  //   caption: 'Penuhi kebutuhan penglihatan keluarga anda\nbersama kami.',
  //   color: 'white',
  //   textColor: 'black',
  // },
  {
    bg: 'white',
    image: LOGO,
    title: '',
    caption: '',
    color: 'white',
    textColor: 'black',
  },
]

function Walkthrough() {
  // Hooks
  const navigation = useAppNavigation();
  const { width, height } = useWindowDimensions();
  const { i18n } = useTranslation();
  const dispatch = useDispatch();
  const netInfo = NetInfo.useNetInfo();

  const carouselRef = useRef<any>();
  // const { current: fadeAnim } = useRef(new Animated.Value(0));

  // States
  const [progress, setProgress] = useState(5);
  const [indexes, setIndexes] = useState<number[]>([0]);
  const [isSwiping, setIsSwiping] = useState<boolean>(false);
  const [shouldWalk, setShouldWalk] = useState(false);
  const [options, setOptions] = useState({
    versionModalOpen: false,
    versionMin: '',
    versionUrl: ''
  });

  // Effects
  useEffect(() => {
    RNSplashScreen.hide();

    (async () => {
      const walkthrough = await Storage.getData('walkthrough');
      const user = await httpService.getUser();
      const lang = await Storage.getData('lang');

      const progressCalc = (step: number) => (100 * step / (4 + 1));

      if (lang) {
        setProgress(progressCalc(1));
        await handleLangChange(lang);
      }

      setProgress(progressCalc(2));
      await shopInit();

      setProgress(progressCalc(3));
      await handleLocateUser();

      setProgress(progressCalc(4));
      const versionValid = await handleVersionCheck();

      if (!versionValid) {
        return handleModalToggle('version', true);
      }

      // return byPass();

      setProgress(100);

      if (!!walkthrough) {
        !user ? setTimeout(() => {
          handleRedirect('home')
        }, 165) : await authorizeUser(user);
      } else {
        setShouldWalk(true);
      }
    })();
  }, []);

  // Vars
  const byPass = () => {
    navigation.navigatePath('Public', {
      screen: 'BottomTabs.AccountStack.Verification',
      params: [null, null, {
        profile: {}
      }]
    });
  };

  const handleFinish = async () => {
    await Storage.storeData('walkthrough', true);

    navigation.reset({
      index: 0,
      routes: [{
        name: 'Public',
        params: { screen: 'BottomTabs' }
      }],
    });
  };

  const authorizeUser = async (user: UserModel) => {
    return (new Promise(resolve => {
      setTimeout(() => {
        httpService.setUser(user);

        resolve(user);
      }, 250);
    })).then(() => {
      handleRedirect('home');
    }).catch(() => {
      httpService.logout().then(() => {
        handleRedirect('home');
      });
    });
  };

  const handleLangChange = async (lang: string) => {
    await i18n.changeLanguage(lang);

    dispatch(setUiLang(lang));
  };

  const shopInit = async () => {
    const cartItems = await Storage.getData('cart_items');

    if (cartItems) {
      dispatch(setCartItems(cartItems));
    }

    dispatch(fetchFavorites());
  };

  const handleLocateUser = async () => {
    let ipAddress = '';

    await httpService('https://api.websetia.com/morita/mobile', {
      method: 'get',
    }).then(({ ip_address }) => {
      if (ip_address) {
        ipAddress = ip_address;
      }
    }).catch((err) => void(0));

    Geolocation.getCurrentPosition(({ coords: { latitude, longitude } }) => {
      dispatch(setUserLocation({
        lat: latitude,
        lng: longitude,
        ip: ipAddress,
      }));
    }, () => {
      dispatch(setUserLocation({
        ip: ipAddress,
      }));
    });
  };

  const handleVersionCheck = async () => {
    let isValid = true;
    await httpService(`/version.json`, {
      method: 'get'
    }).then(({
      version_ios_min, version_ios, link_ios,
      version_android_min, version_android, link_android,
    }) => {
      let current = 0;
      let minimum = 0;
      let versionMin = '';
      let versionUrl = '';

      switch (Platform.OS) {
        case 'ios':
          current = getConfig('app_version_ios') as number;
          minimum = version_ios_min;
          versionMin = version_ios_min;
          versionMin = version_ios;
          versionUrl = link_ios;
          break;
        case 'android':
          current = getConfig('app_version') as number;
          minimum = version_android_min;
          versionMin = version_android;
          versionUrl = link_android;
          break;
      }

      isValid = current >= minimum;

      setOptions(state => ({
        ...state,
        versionMin,
        versionUrl,
      }));
    }).catch(() => void(0));

    return isValid;
  };

  const handleModalToggle = (type: string, open: null | boolean = null) => {
    switch (type) {
      case 'version':
        setOptions(state => ({
          ...state,
          versionModalOpen: 'boolean' === typeof open ? open : !options.versionModalOpen,
        }));
        break;
    }
  };

  const handleRedirect = (to: 'login' | 'home' | 'walk' = 'login') => {
    switch (to) {
      case 'home':
        navigation.reset({
          index: 0,
          routes: [{
            name: 'Public',
            params: { screen: 'BottomTabs' }
          }],
        });
        break;
      case 'login':
        navigation.reset({
          index: 0,
          routes: [{
            name: 'Public',
            params: {
              screen: 'BottomTabs',
              params: {
                screen: 'AccountStack',
                params: { screen: 'Login' },
              }
            },
          }],
        });
        break;
    }
  };

  const renderCarousel = ({ item, index }: ListRenderItemInfo<SlideItem>) => {
    const ImageBgSrc = item.bg;
    const ImageSrc = item.image;

    return (
      <View
        key={index}
        style={[
          styles.carouselItem,
          !item.color ? null : { backgroundColor: item.color }
        ]}
      >
        {'function' !== typeof ImageBgSrc ? (
          <Image source={ImageBgSrc} fadeDuration={index === 0 ? 250 : 60} style={styles.carouselBg} />
        ) : (
          <ImageBgSrc width={210} height={210} style={styles.carouselBg} />
        )}

        <View style={styles.carouselContent}>
          {'function' !== typeof ImageSrc ? (
            <Image source={ImageSrc} style={styles.carouselImage} />
          ) : (
            <ImageSrc width={210} height={210} style={styles.carouselImage} />
          )}

          {!item.title ? null : (
            <View style={{ marginTop: 12 }}>
              <Typography type="h4" textAlign="center" color={item.textColor || 'white'}>
                {item.title}
              </Typography>

              {!item.caption ? null : (
                <Typography textAlign="center" color={item.textColor || 'white'} style={{ marginTop: 2 }}>
                  {item.caption}
                </Typography>
              )}
            </View> 
          )}

          {!item.progress ? null : (
            <ProgressBar
              containerStyle={{
                marginTop: 12,
                width: width * 0.66
              }}
              progress={progress}
              duration={144}
              color="yellow"
            />
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flexGrow: 1 }}>
        <Carousel
          ref={carouselRef}
          data={SLIDES}
          renderItem={renderCarousel}
          sliderWidth={width}
          itemWidth={width}
          onBeforeSnapToItem={() => setIsSwiping(true)}
          onSnapToItem={(slideIndex) => {
            const newIndexes = Array.from(Array(slideIndex + 1)).map((item, index) => index);

            setIndexes(newIndexes);

            setIsSwiping(false);
          }}
          inactiveSlideScale={1}
        />

        <Animatable.View
          style={[styles.carouselDots, {
            opacity: (progress < 100 || !shouldWalk) ? 0 : 1,
          }]}
          easing="ease-in"
          transition="opacity"
          duration={250}
        >
          {indexes.length === SLIDES.length && !isSwiping ? (
            <Button
              rounded
              containerStyle={{ alignSelf: 'center', minWidth: 300 }}
              color="primary"
              label="Lanjutkan"
              onPress={handleFinish}
            />
          ) : (
            <CarouselDots
              activeIndexes={indexes}
              dotCount={SLIDES.length}
              color={colors.black}
            />
          )}
        </Animatable.View>
      </View>

      {/* Version Modal */}
      <BottomDrawer
        isVisible={options.versionModalOpen}
        swipeDirection={null}
        style={{
          paddingTop: 0,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          height
        }}
      >
        <View style={styles.carouselItem}>
          <View style={[styles.carouselContent, { padding: 24 }]}>
            <WalkthroughImage.LogoCircle width={210} height={210} style={styles.carouselImage} />
            <Button
              rounded
              containerStyle={{ alignSelf: 'center', minWidth: 300 }}
              color="yellow"
              label="Lanjutkan"
              onPress={handleFinish}
            /> 
            <Typography type="h4" textAlign="center">
              {`${''}Apps Update`}
            </Typography>

            <Typography textAlign="center" style={{ marginTop: 4 }}>
              {`${''}The latest version is available.`}
              {'\n'}
              {`${''}Update your app to continue.`}
            </Typography>

            <Button
              containerStyle={{ marginTop: 20 }}
              label={`${''}Update Now..`}
              size="lg"
              color="info"
              onPress={() => Linking.openURL(options.versionUrl || getConfig(
                Platform.OS === 'ios' ? 'URL_APP_UPDATE_IOS' : 'URL_APP_UPDATE'
              ) as string)}
            />
          </View>
        </View>
      </BottomDrawer>
    </SafeAreaView>
  )
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    // justifyContent: 'center',
    width: '100%',
    position: 'relative',
    backgroundColor: colors.palettes.white
  },

  carouselItem: {
    position: 'relative',
    flex: 1,
    display: 'flex',
    backgroundColor: colors.white
  },
  carouselBg: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    margin: 'auto',
    resizeMode: 'cover',
    backgroundColor: 'transparent',
  },
  carouselContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  carouselImage: {
    width: 210,
    height: 210,
    resizeMode: 'contain',
  },

  carouselDots: {
    position: 'absolute',
    left: 0,
    bottom: 128,
    width: '100%',
    zIndex: 10,
  },
});

export default Walkthrough;
