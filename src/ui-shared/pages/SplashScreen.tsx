import React, { useEffect } from 'react';
import { StyleSheet, Image, View } from 'react-native';
import { colors } from '../../lib/styles';
import LOGO from '../../assets/app-logo-square.png';
import { httpService, Storage } from '../../lib/utilities';
import { default as RNSplashScreen } from 'react-native-splash-screen';
import { useAppNavigation } from '../../router/RootNavigation';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { setUiLang } from '../../redux/reducers/uiReducer';

function SplashScreen() {
  // Hooks
  const navigation = useAppNavigation();
  const { i18n } = useTranslation();
  const dispatch = useDispatch();

  // States
  useEffect(() => {
    // Onload
    authenticateUser();
  }, []);

  // Vars
  const authenticateUser = async () => {
    const lang = await Storage.getData('lang');
    const user = await httpService.getUser();

    if (lang) {
      await handleLangChange(lang);
    }

    if (user) {
      httpService.setUser(user);
    }

    RNSplashScreen.hide();

    navigation.reset({
      index: 0,
      routes: [{
        name: 'Public',
        params: { screen: 'BottomTabs' }
      }],
    });
  };

  const handleLangChange = async (lang: string) => {
    await i18n.changeLanguage(lang);

    dispatch(setUiLang(lang));
  };

  return (
    <View style={styles.container}>
      <View style={styles.box}>
        <Image source={LOGO} style={styles.logo} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.palettes.white,
    position: 'relative',
  },
  box: {},
  logo: {
    backgroundColor: 'transparent',
    width: 210,
    height: 210,
  },
});

export default SplashScreen;
