import { RouteProp, useRoute } from '@react-navigation/core';
import React, { useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet, ToastAndroid, View } from 'react-native';
import { colors, shadows } from '../../../lib/styles';
import { useAppNavigation } from '../../../router/RootNavigation';
import { Button, Typography } from '../../../ui-shared/components';
import Ionicons from 'react-native-vector-icons/Ionicons'
import { PublicAccountStackParamList } from '../../../router/publicBottomTabs';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../../redux/hooks';
import { httpService } from '../../../lib/utilities';

function PasswordReset() {
  // Hooks
  const navigation = useAppNavigation();
  const route = useRoute<RouteProp<PublicAccountStackParamList, 'PasswordReset'>>();
  const { t } = useTranslation('account');
  const { user, location } = useAppSelector(({ user }) => user);

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false); 

  // Vars
  const handleSubmit = async () => {
    setIsLoading(true);

    return httpService('/api/login/login', {
      data: {
        act: 'GantiPwdByEmail',
        dt: JSON.stringify({
          email: user?.email,
          lat: location.lat,
          lng: location.lng,
          ip: location.ip,
        })
      }
    }).then(({ status }) => {
      setIsLoading(false);

      setIsSuccess(true);
    }).catch((err) => {
      setIsLoading(false);
    });
  };

  const [mailName, mailDomain] = (user?.email || '@').split('@');

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Typography heading>
        {t(`Reset Kata Sandi`)}
      </Typography>

      <Typography style={{ marginTop: 4 }}>
        {t(`Jangan bagikan kata sandi ke siapapun.`)}
      </Typography>

      <View style={{ marginTop: 24 }}>
        <Button
          containerStyle={styles.resetBtnContainer}
          style={{ justifyContent: 'flex-start', height: 60 }}
          label={t(`Ganti Kata Sandi`)}
          labelProps={{ textAlign: 'left', type: 'p' }}
          rounded={5}
          left={(
            <View style={{ marginRight: 15 }}>
              <Ionicons name="key" size={28} color={colors.gray[800]} />
            </View>
          )}
          onPress={() => navigation.navigatePath('Public', {
            screen: 'BottomTabs.AccountStack.PinEdit'
          })}
          loading={isLoading}
        />

        {!isSuccess ? null : (
          <Typography color="green" style={{ marginTop: 6 }}>
            {t(`Password baru sudah kami kirimkan ke email anda.`)}
          </Typography>
        )}
      </View>
    </ScrollView>
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

  resetBtnContainer: {
    ...shadows[3],
    backgroundColor: colors.white,
  }
});

export default PasswordReset;
