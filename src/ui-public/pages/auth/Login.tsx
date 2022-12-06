import { RouteProp, useRoute } from '@react-navigation/core';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, ToastAndroid, View, Text, Alert } from 'react-native';
import { colors, wrapper } from '../../../lib/styles';
import LOGO from '../../../assets/OptikTunggalG.jpg';
import { useAppNavigation } from '../../../router/RootNavigation';
import { ErrorState, ValueOf } from '../../../types/utilities';
import { Button, PressableBox, TextField, Typography } from '../../../ui-shared/components';
import validator from 'validator';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { httpService } from '../../../lib/utilities';
import { useAppSelector } from '../../../redux/hooks';
import { PublicAccountStackParamList } from '../../../router/publicBottomTabs';

type Fields = {
  email?: string,
  password?: string,
};

function Login() {
  // Hooks
  const navigation = useAppNavigation();
  const route = useRoute<RouteProp<PublicAccountStackParamList, 'Login'>>();
  const { user: { location }, shop: { cart_items } } = useAppSelector((state) => state);

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [fields, setFields] = useState<Fields>({
    email: '',
    password: '',
  });
  const [options, setOptions] = useState({
    passwordShow: false,
  });
  const [error, setError] = useState<ErrorState<Fields>>({
    fields: [],
    message: undefined,
  });

  // Effects
  useEffect(() => {
    // 
  }, []);

  // Vars
  const handleFieldChange = (field: keyof Fields, value: ValueOf<Fields>) => {
    setFields(state => ({
      ...state,
      [field]: value
    }));

    setError({
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
    if (!fields.email) {
      return handleErrorShow('email', `${''}Mohon masukkan alamat email Anda.`);
    } else if (!validator.isEmail(fields.email)) {
      return handleErrorShow('email', `${''}Mohon masukkan alamat email yang valid.`);
    } else if (!fields.password) {
      return handleErrorShow('password', `${''}Mohon masukkan PIN Anda.`);
    }

    setIsSaving(true);
    return httpService('/api/login/login', {
      data: {
        act: 'Login',
        dt: JSON.stringify({
          comp: '001',
          LoginID: fields.email,
          LoginPwd: fields.password,
        }),
      }
    }).then(({ status, data, token }) => {
      console.log("LOGIN", data);

      setIsSaving(false);

      if (status == 200) {
        httpService.setUser({
          ...data,
          ...(!token ? null : { token }),
          status: '1',
        }).then(() => {
          navigation.navigatePath('Public', {
            screen: 'BottomTabs.AccountStack.Account',
            params: [null, null, {
              profile: fields,
              data: data
            }],
          });

          setTimeout(() => {
            if (cart_items?.length) {
              return navigation.navigatePath('Public', {
                screen: 'BottomTabs.CartStack.Cart',
              });
            }
          }, 250);
        });
      }else{
        handleErrorShow('password', `${''}Email atau password salah.`);
      }
    }).catch((err) => {
      setIsSaving(false);

      handleErrorShow('password', `${''}Email atau password salah.`);
    });
  };

  const handleFieldShow = (field: keyof Fields, toggle: null | boolean = null) => {
    let optionName: keyof typeof options;

    switch (field) {
      case 'password':
        optionName = 'passwordShow';
        break;
    }

    setOptions(state => ({
      ...state,
      [optionName]: 'boolean' === typeof toggle ? toggle : !options[optionName],
    }));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={LOGO} 
               style={{ marginBottom: -50, width: 250, marginTop: -100 }}/>
      {/* <View style={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', marginTop: -350 }}> */}
        <TextField
          placeholder={`${''}Email address`}
          value={fields.email}
          onChangeText={(value) => handleFieldChange('email', value)}
          keyboardType="email-address"
          autoCapitalize="none"
          error={!!getFieldError('email')}
          message={error.message}
        />

        <TextField
          containerStyle={{ marginTop: 12 }}
          placeholder={`${''}Password`}
          value={fields.password}
          onChangeText={(value) => handleFieldChange('password', value)}
          autoCompleteType="password"
          secureTextEntry={!options.passwordShow}
          autoCapitalize="none"
          error={!!getFieldError('password')}
          message={error.message}
          right={(
            <Button
              size={24}
              onPress={() => handleFieldShow('password')}
            >
              <Ionicons
                name={!options.passwordShow ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color={colors.gray[700]}
              />
            </Button>
          )}
        />

        <Button
          containerStyle={{ alignSelf: 'center', borderRadius: 5, backgroundColor: '#0d674e',  marginTop: 30}}
          style={{ width: 300, height: 40,  }}
          shadow={3}
          onPress={handleSubmit}
          loading={isSaving}
        >
          <Typography style={{ color: '#FFF' }}>LOGIN</Typography>
        </Button>
        {/* <Typography size='sm' style={{textAlign: 'center', marginVertical: 15}}> - OR WITH - </Typography>
        <Button
          containerStyle={{ alignSelf: 'center', borderRadius: 5, borderColor: '#0d674e', borderWidth: 1}}
          style={{ width: 300, height: 40,  }}
          shadow={3}
          onPress={handleSubmit}
          loading={isSaving}
        >
          <Typography style={{ color: '#333' }}>
            <Image source={{ uri: 'https://www.fintechfutures.com/files/2016/03/google.png' }} style={styles.avatar} />
            oogle
          </Typography>
        </Button> */}

        <View style={[wrapper.row, { alignItems: 'center', marginHorizontal: 10 }]}>
          <PressableBox
            containerStyle={{ marginTop: 40, alignSelf: 'center', padding: 5 }}
            opacity
            onPress={() => {
              navigation.navigatePath('Public', {
                screen: 'BottomTabs.AccountStack.ForgotPassword',
              });
            }}
          >
            <Typography size="sm" color="#cd0505" style={{}}>
              Lupa Kata Sandi?
            </Typography>
          </PressableBox>
          <Typography style={{ paddingHorizontal: 10, marginTop: 40, color: '#0d674e'}}>
            |
          </Typography>
          <PressableBox
            containerStyle={{ marginTop: 40, alignSelf: 'center', padding: 5 }}
            opacity
            onPress={() => navigation.navigatePath('Public', {
              screen: 'Register'
            })}
          >
            <Typography size="sm" color="#0d674e" style={{}}>
              Segera Buat Akun?
            </Typography>
          </PressableBox>
        </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 12,
    paddingHorizontal: 30,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -150
  },
  avatar: {
    alignSelf: 'center',
    width: 20,
    height: 20,
  },
});

export type { Fields as LoginFields };

export default Login;
