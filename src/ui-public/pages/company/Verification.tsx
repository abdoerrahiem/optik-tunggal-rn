import { RouteProp, useRoute } from '@react-navigation/core';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, TextInput, ToastAndroid, useWindowDimensions, View, Alert, BackHandler } from 'react-native';
import { RegisterFields } from '.';
import { colors, typography, wrapper } from '../../../lib/styles';
import { httpService } from '../../../lib/utilities';
import { useAppSelector } from '../../../redux/hooks';
import { PublicAccountStackParamList } from '../../../router/publicBottomTabs';
import { useAppNavigation } from '../../../router/RootNavigation';
import { ErrorState, ValueOf } from '../../../types/utilities';
import { Button, PressableBox, TextField, Typography, BottomDrawer } from '../../../ui-shared/components';
import validator from 'validator';
import Ionicons from 'react-native-vector-icons/Ionicons';


type Fields = {
  otp_code?: string;
  email?: string;
  nomorhp?: string;
};

type OptionsState = {
  otp?: [];
  otpLoaded?: boolean;
  otpModalOpen?: boolean;
}

function Verification() {
  // Hooks
  const navigation = useAppNavigation();
  const route = useRoute<RouteProp<PublicAccountStackParamList, 'Verification'>>();
  const { user, location } = useAppSelector(({ user }) => user);
  const { t } = useTranslation('account');
  const { width, height } = useWindowDimensions();
  const inputRef = useRef<TextInput>();
  const timerTO = useRef<any>();

  // States
  const [isSaving, setIsSaving] = useState(false);
  const [fields, setFields] = useState<Fields>({
    otp_code: '',
    email: '',
    nomorhp: ''
  });
  const [error, setError] = useState<ErrorState<Fields>>({
    fields: [],
    message: undefined,
  });
  const [inputLength, setInputLength] = useState(6);
  const [profile, setProfile] = useState<RegisterFields | null>(null);
  const [timer, setTimer] = useState(60);

  const [options, setOptions] = useState<OptionsState>({
    otp: [],
    otpLoaded: false,
    otpModalOpen: false,
  });
  // Effects
  useEffect(() => {
    if (route.params?.profile) {
      setProfile(route.params.profile);
    }

    route.params.email && handleFieldChange('email', route.params.email);
  }, [route.params]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    clearTimeout(timerTO.current);
    beginTimer();
  }, []);

  // Vars
  const beginTimer = () => {
    timer > 0 && setTimer(state => state - 1);

    clearTimeout(timerTO.current);

    timerTO.current = setTimeout(() => {
      beginTimer();
    }, 1000);
  };

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

  const handleCloseModal = async () => {
    handleModalToggle('filterotp', false);
  };

  const handleModalToggle = async (type: string, open: boolean | null = null) => {
    let newState: Partial<OptionsState> = {};

    switch (type) {
      case 'filterotp':
        newState.otpModalOpen = 'boolean' === typeof open ? open : !options.otpModalOpen;
        break;
    }

    setOptions(state => ({
      ...state,
      ...newState,
    }));
  };

  const handleSubmit = async () => {
    if (!fields.otp_code) {
      return handleErrorShow('otp_code', t(`OTP code is not complete.`));
    }

    setIsSaving(true);

    return httpService('/api/login/login', {
      data: {
        act: 'CekVerifikasi',
        dt: JSON.stringify({
          email: route.params.email,
          otp: fields.otp_code,
          hp: route.params.hp
        }),
      },
    }).then(({ status, data, msg }) => {
      setIsSaving(false);

      if (status === 200) {
        httpService.setUser({
          ...user,
          ...data,
          verified: 1,
        }).then(() => {
          navigation.navigatePath('Public', {
            screen: 'PinEdit',
            params: [{
              action: 'register',
              email: user?.email || fields.email,
            }],
          });
        });
      }else{
        Alert.alert( "Notifikasi", "Kode OTP yang anda masukan salah.",[{ text: "Oke", onPress: () => console.log("OK Pressed") }]);
      }
    }).catch(({ msg }) => {
      setIsSaving(false);

      if ('string' === typeof msg) {
        switch (msg.toLowerCase()) {
          case 'kode verifikasi tidak valid':
            handleErrorShow('otp_code', t(`Invalid verification code`));
            break;
        }
      }
    });
  };

  const kirimOTP = async (email: string, nohp: string, flaq: any) => {
    return httpService(`/api/login/login`, {
      data: {
        act: 'kirimOTPforuserExist',
        dt: JSON.stringify({ email, nohp: nohp, flaq: flaq }),
      },
    }).then(({ status, data }) => {
      handleCloseModal()
      if(status === 203){
        Alert.alert( "Notifikasi", "Permintaan kode OTP melebihi batas, kami akan kirimkan kode ke email "+email,
        [{ 
          text: "Oke", onPress: () => kirimOTP(email, "", "email"),
        }]);
      }else if (status === 200) {
        ToastAndroid.show(t(`Kode verifikasi sudah dikirmkan ke email anda.`), ToastAndroid.SHORT);
      }
    }).catch(() => {
      setIsSaving(false);
    });
  };

  const handleVerificationResend = () => {
    setIsSaving(true);

    return httpService('/api/login/login', {
      data: {
        act: 'KirimUlangOTP',
        dt: JSON.stringify({
          comp: '001',
          nohp: route.params.hp || fields.nomorhp,
          email: fields.email,
          flaq: route.params.flaq === 'wa' ? 'wa' : 'mail', 
          lat: location.lat,
          lng: location.lng,
          ip: location.ip,
        })
      }
    }).then(({ status }) => {
      setIsSaving(false);

      if (200 === status) {
        setTimer(120);

        ToastAndroid.show(t(`Kode verifikasi sudah terkirim.`), ToastAndroid.SHORT);
      }
    }).catch((err) => {
      setIsSaving(false);

      return handleErrorShow('email', t(`Email address not registered.`));
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={{ paddingTop: 24, alignSelf: 'center' }}>
        <Typography heading style={{ marginTop: 2, color: '#333', textAlign: 'center' }}>
          {t(`${''}Masukan Kode Verifikasi`)}
        </Typography>
        {route.params?.flaq === "mail" ? (
          <Typography style={{ marginTop: 2, color: '#333', textAlign: 'center' }}>
            {t(`${''}Kode verifikasi sudah kami kirimkan ke email anda. Silahkan cek inbox atau spam di email anda.`)}
          </Typography>
        )
        :
        (
          <Typography style={{ marginTop: 2, color: '#333', textAlign: 'center' }}>
            {t(`${''}Kode verifikasi kami kirimkan melalui whatsapp dengan nomor +`+route.params.hp+`.`)}
          </Typography>
        )}
      </View>
      {/* <Typography textAlign="center" style={{ paddingTop: 24 }}>
        {moment().startOf('day').set('second', timer).format('mm:ss')}
      </Typography> */}

      <View style={styles.inputsWrap}>
        <TextInput
          ref={inputRef as any}
          style={styles.input}
          value={fields.otp_code}
          maxLength={inputLength}
          onChangeText={(value) => handleFieldChange('otp_code', value)}
          keyboardType="number-pad"
        />

        <View style={styles.inputs}>
          {Array.from(Array(inputLength)).map((item, index) => (
            <PressableBox
              key={index}
              opacity={1}
              containerStyle={{ marginHorizontal: 6, overflow: 'visible' }}
              style={styles.inputWrap}
              onPress={() => inputRef.current?.focus()}
            >
              <TextField
                value={!fields.otp_code ? '' : fields.otp_code[index]}
                maxLength={1}
                containerStyle={styles.inputField}
                style={styles.inputItem}
                editable={false}
                pointerEvents="none"
                showSoftInputOnFocus={false}
              />
            </PressableBox>
          ))}
        </View>

        {!getFieldError('otp_code') ? null : (
          <Typography size="sm" color="red" textAlign="center" style={{ marginTop: 12 }}>
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

          <View style={[wrapper.row]}>
            <PressableBox
              containerStyle={{ marginTop: 30, flex: 1, alignSelf: 'center' }}
              opacity
              onPress={() => handleModalToggle('filterotp', true)}
            >
              <Typography heading size="xs" style={{textAlign: 'left'}} color={!profile ? 'red' : 900}>
                {`${''}Ubah nomor handphone?`}
              </Typography>
            </PressableBox>

            <PressableBox
              containerStyle={{ marginTop: 30, flex: 1, alignSelf: 'center' }}
              opacity
              onPress={handleVerificationResend}
            >
              <Typography heading size="xs" color={!profile ? '#0d674e' : 900} style={{
                textDecorationLine: 'underline', textAlign: 'right'
              }}>
                {`${''}Kirim Ulang Kode OTP`}
              </Typography>
            </PressableBox>
          </View>
        </View>
      </View>

      <BottomDrawer
        isVisible={options.otpModalOpen}
        swipeDirection={null}
        onBackButtonPress={() => handleModalToggle('filterotp', false)}
        onBackdropPress={() => handleModalToggle('filterotp', false)}
        style={{ maxHeight: height * 0.75 }}
      >
        <Button
          containerStyle={{ alignItems: 'flex-end', marginBottom: 5, marginTop: -15 }}
          onPress={handleCloseModal}
        >
          <Typography style={{ color: '#333' }}>Tutup</Typography>
          <Ionicons name="ios-close" size={24} color={'#333'} />
        </Button>
        <Typography size='sm' style={{ paddingVertical: 10, paddingHorizontal: 15, color: '#0d674e', textAlign: 'justify' }}>
          {`Masukan nomor handphone yang terhubung dengan whatsapp untuk menerima kode OTP.`}
        </Typography>
        <View style={{borderColor: '#0d674e', borderWidth: 1, marginHorizontal: 15}}/> 
        <View style={{marginHorizontal: 15, marginVertical: 20}}>
          <TextField
            placeholder={t('contoh : 8123456789')}
            value={fields.nomorhp}
            style={{marginVertical: 10}}
            onChangeText={(value) => handleFieldChange('nomorhp', value)}
            error={!!getFieldError('nomorhp')}
            keyboardType={'number-pad'}
            message={error.message}
          />
        </View>
        <PressableBox
          onPress={() => kirimOTP(route.params.email, fields.nomorhp, 'ubahnowa')}
          containerStyle={{height: 'auto', marginBottom: 80}}
          style={{ marginVertical: 10, marginHorizontal: 20, backgroundColor: '#0d674e', borderColor: '#0d674e', borderWidth: 1, borderRadius: 10}}
        >
          <View style={[wrapper.row]}>
            <Typography style={{textAlign: 'center', paddingVertical: 10, flex: 1, color: '#fff'}}>
              {`Dapatkan Kode OTP`}
            </Typography>
          </View>
        </PressableBox>
      </BottomDrawer>
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

  inputsWrap: {
    maxWidth: 260,
    alignSelf: 'center',
    alignItems: 'center',
  },
  inputs: {
    ...wrapper.row,
    justifyContent: 'space-between',
    position: 'relative',
    marginTop: 32,
    marginHorizontal: -6,
  },
  input: {
    position: 'absolute',
    opacity: 0,
  },
  inputWrap: {
    ...wrapper.row,
    paddingHorizontal: 0,
    width: 40,
    zIndex: 10,
  },
  inputField: {
    flex: 1,
    paddingHorizontal: 0,
    borderColor: colors.gray[500]
  },
  inputItem: {
    ...typography.h3,
    paddingTop: 12,
    paddingBottom: 8,
    paddingHorizontal: 0,
    textAlign: 'center',
  },
});

export type { Fields as VerificationFields };

export default Verification;