import { RouteProp, useRoute } from '@react-navigation/core';
import React, { useEffect, useRef, useState } from 'react';
import { Image, ScrollView, StyleSheet, ToastAndroid, useWindowDimensions, View, Alert } from 'react-native';
import { colors } from '../../../lib/styles';
import { useAppNavigation } from '../../../router/RootNavigation';
import { ErrorState, ValueOf } from '../../../types/utilities';
import { BottomDrawer, Button, PressableBox, TextField, Typography } from '../../../ui-shared/components';
import Ionicons from 'react-native-vector-icons/Ionicons'
import { BannerWelcome } from '../../../assets/images/banners';
import { PublicAccountStackParamList } from '../../../router/publicBottomTabs';
import { useTranslation } from 'react-i18next';
import { httpService } from '../../../lib/utilities';
import { useAppSelector } from '../../../redux/hooks';

type Fields = {
  new_pin?: string,
  new_pin_confirmation?: string,
};

function PinEdit() {
  // Hooks
  const navigation = useAppNavigation();
  const route = useRoute();
  const { width, height } = useWindowDimensions();
  const { t } = useTranslation('account');
  const reduxState = useAppSelector(({ user, shop }) => ({ user, shop }));
  const { user: { user }, shop: { cart_items } } = reduxState;

  const redirectTO = useRef<any>();

  // States
  const [isSaving, setIsSaving] = useState(false);
  const [fields, setFields] = useState<Fields>({
    new_pin: '',
    new_pin_confirmation: '',
  });
  const [error, setError] = useState<ErrorState<Fields>>({
    fields: [],
    message: undefined,
  });
  const [options, setOptions] = useState({
    newPinShow: false,
    newPinConfirmationShow: false,
    welcomeModalOpen: false,
  });
  const [isRegister, setIsRegister] = useState(false);

  // Effects
  useEffect(() => {
    route.params?.action && setIsRegister('register' === route.params.action);
  }, [route.params]);

  useEffect(() => {
    if (fields.new_pin && fields.new_pin.length < 6) {
      setError(state => ({
        ...state,
        fields: ['new_pin'],
        message: `${''}Enter at least 6 characters for your Password.`
      }));
    }
  }, [fields.new_pin]);

  // Vars
  const handleFieldChange = (field: keyof Fields, value: ValueOf<Fields>) => {
    const { fields = [] } = error;

    setFields(state => ({
      ...state,
      [field]: value
    }));

    fields.indexOf(field) >= 0 && setError({
      fields: [],
      message: undefined,
    });
  };

  const handleErrorShow = (fields: keyof Fields | Array<keyof Fields>, message: string) => {
    ToastAndroid.show(message, ToastAndroid.SHORT);

    setError({
      fields: 'string' === typeof fields ? [fields] : fields as Array<keyof Fields>,
      message
    });
  };

  const getFieldError = (field: keyof Fields) => {
    const { fields = [] } = error;

    return fields.indexOf(field) < 0 ? null : error.message;
  };

  const handleSubmit = async () => {
    let errorMessage = '';

    if (fields.new_pin && fields.new_pin.length < 6) {
      errorMessage = `${''}Enter at least 6 characters for your password.`;
    } else if (!fields.new_pin?.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?!.*[&%$]).{6,}$/g)) {
      errorMessage = `${''}Password must have a combination of uppercase, lowercase and numbers.`;
    } else if (!fields.new_pin || !fields.new_pin_confirmation) {
      errorMessage = `${''}Please enter the complete password.`;
    } else if (fields.new_pin !== fields.new_pin_confirmation) {
      errorMessage = `${''}Please enter the complete password..`;
    }

    if (errorMessage) {
      return handleErrorShow(['new_pin', 'new_pin_confirmation'], errorMessage);
    }

    setIsSaving(true);
    return httpService('/api/login/login', {
      data: {
        act: 'GantiPwd',
        dt: JSON.stringify({
          email: route.params.email,
          pwd: fields.new_pin,
          nama: !route?.params.nama ? null : (route.params.nama)
        }),
      }
    }).then(({ status, data }) => {
      if (200 === status) {
        // handleWelcomeToggle(true);

        !user?.verified && httpService.setUser({
          ...user,
          verified: 1
        });
        // ToastAndroid.show(`${''}Password berhasil dibuat.`, ToastAndroid.SHORT);
        // navigation.navigatePath('Public', {
        //   screen: 'BottomTabs.AccountStack.PasswordReset',
        //   params: [{email: route.params.email}],
        // });

        Alert.alert( "Success!", "You have successfully registered an account.",
                    [{ 
                      text: "Login", onPress: () => 
                        navigation.navigatePath('Public', { 
                          screen: 'BottomTabs.AccountStack.Login',
                          param: [{aksi : 'ubah'}]
                        })
                    }]);

        // redirectTO.current = setTimeout(() => {
        //   handleWelcomeToggle(false, true);
        // }, 1000);
      }
    });
  };

  const handleFieldShow = (field: keyof Fields, toggle: null | boolean = null) => {
    let optionName: keyof typeof options;

    switch (field) {
      case 'new_pin':
        optionName = 'newPinShow';
        break;
      case 'new_pin_confirmation':
        optionName = 'newPinConfirmationShow';
        break;
    }

    setOptions(state => ({
      ...state,
      [optionName]: 'boolean' === typeof toggle ? toggle : !options[optionName],
    }));
  };

  const handleWelcomeToggle = (toggle: null | boolean = null, redirect = false) => {
    const open = 'boolean' === typeof toggle ? toggle : !options.welcomeModalOpen;

    setOptions(state => ({
      ...state,
      welcomeModalOpen: open,
    }));

    if (!open && redirect) {
      if (redirectTO.current) {
        clearTimeout(redirectTO.current);
      }

      if (isRegister) {
        navigation.navigatePath('Public', {
          screen: 'BottomTabs.AccountStack.Home',
        });

        cart_items?.length && setTimeout(() => {
          navigation.navigatePath('Public', {
            screen: 'BottomTabs.CartStack.Cart',
          });
        }, 250);
      } else {
        navigation.navigatePath('Public', {
          screen: 'BottomTabs.AccountStack.Home'
        });
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/*{isRegister ? null : (
        <View style={{ marginTop: 24 }}>
          <Typography style={{ marginTop: 2, textAlign: 'center' }}>
            {t(`${''}Pastikan password memiliki kombinasi Huruf Besar, Huruf Kecil dan Angka`)}
          </Typography>

          <Typography style={{ marginTop: 2, textAlign: 'center' }}>
            Email anda {user?.email}
          </Typography>
        </View>
      )}*/}

      <View style={{ marginTop: 24 }}>
        <Typography style={{ marginTop: 2, textAlign: 'center' }}>
          {t(`${''}Pastikan password mengandung kombinasi huruf besar, huruf kecil, angka / simbol.`)}
        </Typography>

        <Typography style={{ marginTop: 2, textAlign: 'center' }}>
          Email anda {route.params.email}
        </Typography>
      </View>

      <TextField
        containerStyle={{ marginTop: 50 }}
        placeholder={`${''}Masukkan kata sandi baru`}
        value={fields.new_pin}
        onChangeText={(value) => handleFieldChange('new_pin', value)}
        autoCompleteType="password"
        secureTextEntry={!options.newPinShow}
        autoCapitalize="none"
        right={(
          <Button
            size={24}
            onPress={() => handleFieldShow('new_pin')}
          >
            <Ionicons
              name={!options.newPinShow ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={colors.gray[700]}
            />
          </Button>
        )}
      />

      <TextField
        containerStyle={{ marginTop: 12 }}
        placeholder={`${''}Masukkan kata sandi baru`}
        value={fields.new_pin_confirmation}
        onChangeText={(value) => handleFieldChange('new_pin_confirmation', value)}
        autoCompleteType="password"
        secureTextEntry={!options.newPinConfirmationShow}
        autoCapitalize="none"
        right={(
          <Button
            size={24}
            onPress={() => handleFieldShow('new_pin_confirmation')}
          >
            <Ionicons
              name={!options.newPinConfirmationShow ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={colors.gray[700]}
            />
          </Button>
        )}
      />

      {!getFieldError('new_pin') && !getFieldError('new_pin_confirmation') ? null : (
        <Typography size="sm" color="red" style={{ marginTop: 8 }}>
          {error.message}
        </Typography>
      )}

      <View style={{ marginTop: 30, paddingTop: 24 }}>
        <Button
            containerStyle={{ alignSelf: 'center', backgroundColor: '#0d674e' }}
            style={{ width: 320, height: 40 }}
            shadow={3}
            onPress={handleSubmit}
            loading={isSaving}
          >
            <Typography style={{color: '#FFFFFF'}}>SUBMIT</Typography>
          </Button>
      </View>

      {/* Popup Welcome */}
      {/*<BottomDrawer
        isVisible={options.welcomeModalOpen}
        swipeDirection={null}
        onBackButtonPress={() => handleWelcomeToggle(false, true)}
        onBackdropPress={() => handleWelcomeToggle(false, true)}
        containerStyle={{
          borderTopLeftRadius: 0,
          height: height,
        }}
        style={{
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          height: height,
          paddingTop: 0,
        }}
      >
        <View
          style={[styles.popMaster, { minHeight: height}]}
        >
          <PressableBox
            containerStyle={{
              marginHorizontal: 0,
              flex: 1,
            }}
            style={{
              paddingHorizontal: 15,
              flexDirection: 'column',
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            opacity={1}
            onPress={() => handleWelcomeToggle(false, true)}
          >
            <BannerWelcome width={width * 0.7} height={width * 0.7} />

            {!isRegister ? (
              <View style={{ marginTop: 12 }}>
                <Typography type="h4" color="black" textAlign="center">
                  {`${''}Selamat`.toUpperCase()}
                </Typography>

                <Typography type="h6" color="black" textAlign="center" style={{ marginTop: 4 }}>
                  {`${''}Terima Kasih sudah mendaftar di \n OPTIK TUNGGAL Apps.`}
                </Typography>
              </View>
            ) : (
              <View style={{ marginTop: 12 }}>
                <Typography type="h4" color="black" textAlign="center">
                  {`${''}Selamat Datang`.toUpperCase()}
                </Typography>

                <Typography type="h6" color="black" textAlign="center" style={{ marginTop: 4 }}>
                  {`${''}Terimakasih telah mendaftar!`}
                </Typography>
              </View>
            )}
          </PressableBox>
        </View>
      </BottomDrawer>*/}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 15,
    paddingBottom: 24,
    backgroundColor: colors.white,
  },

  popMaster: {
    marginTop: -24,
    flexGrow: 1,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});

export type { Fields as PinEditFields };

export default PinEdit;
