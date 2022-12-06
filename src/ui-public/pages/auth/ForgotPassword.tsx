import { useRoute } from '@react-navigation/core';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, ToastAndroid, View, Alert } from 'react-native';
import { colors } from '../../../lib/styles';
import { useAppNavigation } from '../../../router/RootNavigation';
import { ErrorState, ValueOf } from '../../../types/utilities';
import { Button, TextField, Typography } from '../../../ui-shared/components';
import validator from 'validator';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { httpService } from '../../../lib/utilities';
import { useAppSelector } from '../../../redux/hooks';

type Fields = {
  email?: string,
  password?: string,
};

function ForgotPassword() {
  // Hooks
  const navigation = useAppNavigation();
  const route = useRoute();
  const { location } = useAppSelector(({ user }) => user);

  // States
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fields, setFields] = useState<Fields>({
    email: '',
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
    if (!fields.email) {
      return handleErrorShow('email', `${''}Format email salah.`);
    } else if (!validator.isEmail(fields.email)) {
      return handleErrorShow('email', `${''}Format email salah.`);
    }

    setIsSaving(true);

    return httpService('/api/login/login', {
      data: {
        act: 'LupaPwd',
        dt: JSON.stringify({
          comp: '001',
          email: fields.email,
          lat: location.lat,
          lng: location.lng,
          ip: location.ip,
        })
      }
    }).then(({ status }) => {
      setIsSaving(false);

      if (200 === status) {
        Alert.alert( "Berhasil", "password berhasil diubah. silahkan cek email anda!",
          [
            { text: "OK", onPress: () => 
              navigation.navigatePath('Public', {
                screen: 'BottomTabs.AccountStack.Verification',
                params: [null, null, {
                  email: fields.email
                }]
              })
            }
          ]
        );
      } else {
        return handleErrorShow('email', `${''}Email address is not registered.`);
      }
    }).catch((err) => {
      setIsSaving(false);

      return handleErrorShow('email', `${''}Email address is not registered.`);
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Typography type="h5" style={{ marginTop: 12 }}>
        {`${''}Masukan email anda.`}
      </Typography>

      <Typography size="sm" color={700} textAlign="center" style={{ marginTop: 4 }}>
        {`${''}Kami akan mengirimkan link untuk perubahan password ke email anda.`}
      </Typography>

      <TextField
        containerStyle={{ marginTop: 50 }}
        placeholder={`${''}Email`}
        value={fields.email}
        onChangeText={(value) => handleFieldChange('email', value)}
        keyboardType="email-address"
        autoCapitalize="none"
        error={!!getFieldError('email')}
        message={error.message}
      />

      <View style={{ marginTop: 'auto', paddingTop: 24, marginBottom: 50 }}>
        <Button
          containerStyle={{ alignSelf: 'center', backgroundColor: '#0d674e' }}
          style={{ width: 300, height: 40 }}
          shadow={3}
          onPress={handleSubmit}
          loading={isSaving}
        >
          <Typography style={{ color: '#FEFEFE' }}>
            {`${''}Kirim Permintaan`.toUpperCase()}
          </Typography>
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 15,
    paddingBottom: 24,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center'
  },
});

export type { Fields as ForgotPasswordFields };

export default ForgotPassword;
