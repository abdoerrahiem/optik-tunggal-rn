import React from 'react';
import { useTranslation } from 'react-i18next';
import { Image, View } from 'react-native';
import { useAppNavigation } from '../../router/RootNavigation';
import { Button, PressableBox, Typography } from '../../ui-shared/components';

function AccountBanner() {
  // Hooks
  const navigation = useAppNavigation();
  const { t } = useTranslation('account');

  return (
    <View style={{ flex: 1 }}>
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <Image
          source={require('../../assets/images/banners/logowhite.png')}
          style={{
            width: 215,
            height: 215,
            resizeMode: 'contain'
          }}
        />
      </View>

      <View style={{
        paddingTop: 12,
        paddingBottom: 64,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <Button
          containerStyle={{ marginTop: 16 }}
          style={{ width: 160 }}
          rounded
          label={t('Daftar').toUpperCase()}
          color="yellow"
          shadow={3}
          onPress={() => navigation.navigatePath('Public', {
            screen: 'Register'
          })}
        />

        <PressableBox
          containerStyle={{ marginTop: 8, alignSelf: 'center' }}
          opacity
          onPress={() => {
            navigation.navigatePath('Public', {
              screen: 'BottomTabs.AccountStack.Login',
            });
          }}
        >
          <Typography heading size="sm" color="white" style={{
            textDecorationLine: 'underline',
          }}>
            {t('Saya sudah memiliki akun').toUpperCase()}
          </Typography>
        </PressableBox>
      </View>
    </View>
  );
};

export default AccountBanner;
