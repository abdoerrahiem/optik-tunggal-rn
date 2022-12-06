import React from 'react';
import { useTranslation } from 'react-i18next';
import { Image, View, StyleSheet } from 'react-native';
import { wrapper, colors } from '../../lib/styles';
import { useAppNavigation } from '../../router/RootNavigation';
import { Button, PressableBox, Typography } from '../../ui-shared/components';
import Ionicons from 'react-native-vector-icons/Ionicons';

function AccountBanner() {
  // Hooks
  const navigation = useAppNavigation();
  const { t } = useTranslation('account');

  return (
    <View style={{ flex: 1, backgroundColor: '#FEFEFE', marginVertical: 15 }}>
      <Button
        containerStyle={{
          position: 'absolute',
          marginHorizontal: 10,
          marginVertical: 10,
          backgroundColor: colors.white,
        }}
        size={40}
        rounded={40}
        onPress={() => navigation.navigatePath('Public', {
          screen: 'BottomTabs.HomeStack.Home'
        })}
      >
        <Ionicons
          name="arrow-back"
          size={28}
          style={{ marginTop: 2 }}
        />
      </Button>
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: -20
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

      <View style={[wrapper.row,{
        paddingBottom: 84,
        justifyContent: 'center',
        alignItems: 'center',
      }]}>

        <Button
          style={{ width: 160, backgroundColor: '#cccccc' }}
          label={t('LOGIN').toUpperCase()}
          shadow={1}
          rounded
          onPress={() => {
            navigation.navigatePath('Public', {
              screen: 'BottomTabs.AccountStack.Login',
            });
          }}
        />
        <View style={{ width: 20}}></View>
        <Button
          style={{ width: 160, backgroundColor: '#FEFEFE', borderRadius: 5 }}
          label={t('REGISTER').toUpperCase()}
          rounded
          color="yellow"
          shadow={1}
          onPress={() => navigation.navigatePath('Public', {
            screen: 'Register'
          })}
        />
      </View>
    </View>
  );
};

export default AccountBanner;
