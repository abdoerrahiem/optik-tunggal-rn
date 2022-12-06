import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, Platform } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../lib/styles';
import { FigmaIcon } from '../assets/icons';
import { useAppSelector } from '../redux/hooks';
import {
  PublicHomeStack,
  PublicAccountStack,
  PublicNotificationStack,
  PublicArticleStack,
  PublicContactStack,
  PublicMemberStack,
  PublicFavoriteStack,
  PublicCartStack,
  PublicOurStoreStack
} from './publicBottomTabs';
import { useTranslation } from 'react-i18next';
import { FocusAwareStatusBar } from '../ui-shared/components';

export type PublicBottomTabParamList = {
  HomeStack: {};
  NotificationStack: {};
  MemberStack: {},
  ContactStack: {};
  FavoriteStack: {};
  AccountStack: {};
  ArticleStack: {};
  CartStack: {};
  OurStoreStack: {};
};

const Tab = createBottomTabNavigator<PublicBottomTabParamList>();

function PublicBottomTab() {
  // Hooks
  const { user } = useAppSelector(({ user }) => user);
  const { t } = useTranslation('general');

  // Vars
  const iconProps = ({ size, focused }: {
    focused: boolean;
    color: string;
    size: number;
  }) => ({
    width: 30, // size,
    height: 30, // size,
    color: colors.gray[500],
    ...(!focused ? null : { color: '#0d674e' }),
  });

  return (
    <SafeAreaView style={{
      flex: 1,
      backgroundColor: colors.palettes.white,
    }}>
      <FocusAwareStatusBar
        backgroundColor={colors.palettes.skyblue}
        barStyle="dark-content"
      />

      <Tab.Navigator
        initialRouteName="HomeStack"
        screenOptions={{
          tabBarActiveTintColor: '#0d674e',
          tabBarStyle: {
            height: 64,
            paddingTop: 8,
            paddingBottom: 8,
            ...(Platform.OS !== 'ios' ? null : { paddingBottom: 0 }),
          },
          headerShown: false,
        }}
      >
        <Tab.Screen
          name="HomeStack"
          component={PublicHomeStack}
          options={{
            tabBarLabel: t('Home'),
            tabBarIcon: (iconParams) => (
              <FigmaIcon.FigmaHome {...iconProps(iconParams)} />
            ),
          }}
        />
        <Tab.Screen
          name="MemberStack"
          component={PublicMemberStack}
          options={{
            tabBarLabel: t('Anggota'),
            tabBarIcon: (iconParams) => (
              <FigmaIcon.FigmaMember {...iconProps(iconParams)} />
            ),
          }}
        />
        <Tab.Screen
          name="CartStack"
          component={PublicCartStack}
          options={{
            tabBarLabel: t('Keranjang'),
            tabBarIcon: (iconParams) => (
              <FigmaIcon.FigmaCatalogue {...iconProps(iconParams)} />
            ),
          }}
        />
        <Tab.Screen
          name="OurStoreStack"
          component={PublicOurStoreStack}
          options={{
            tabBarLabel: t('Toko'),
            tabBarIcon: (iconParams) => (
              <FigmaIcon.FigmaFavorite {...iconProps(iconParams)} />
            ),
          }}
        />
        {/* <Tab.Screen
          // name="FavoriteStack"
          name="ArticleStack"
          component={PublicArticleStack}
          options={{
            tabBarLabel: t('Kabar'),
            tabBarIcon: (iconParams) => (
              <FigmaIcon.FigmaNews {...iconProps(iconParams)} />
            ),
          }}
        /> */}
        <Tab.Screen
          name="AccountStack"
          component={PublicAccountStack}
          options={{
            tabBarLabel: t('Akun'),
            tabBarIcon: (iconParams) => (!user?.foto || true) ? (
              <FigmaIcon.FigmaAccount {...iconProps(iconParams)} />
            ) : (
              <Image
                source={{ uri: user?.foto }}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 20,
                  resizeMode: 'cover',
                }}
              />
            ),
          }}
        />
      </Tab.Navigator>
    </SafeAreaView>
  );
}

export default PublicBottomTab;
