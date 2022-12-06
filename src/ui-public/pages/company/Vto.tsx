import { useRoute } from '@react-navigation/core';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, useWindowDimensions, View, Image, ImageBackground, Alert } from 'react-native';
import { colors, shadows, wrapper } from '../../../lib/styles';
import { useAppNavigation } from '../../../router/RootNavigation';
import { Typography, PressableBox, Button } from '../../../ui-shared/components';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../../redux/hooks';
import { WebView } from 'react-native-webview';

function Vto() {
  // Hooks
  const navigation = useAppNavigation();
  const route = useRoute();
  const { width, height } = useWindowDimensions();
  const { t } = useTranslation('notification');
  const { user: { user } } = useAppSelector((state) => state);


  return (
    <View style={{ flex: 1 }}>
      <WebView 
            style={{flex: 1}}
            mediaPlaybackRequiresUserAction={false}
            domStorageEnabled={true}
            allowsInlineMediaPlayback={true}
            startInLoadingState={true}
            allowUniversalAccessFromFileURLs={true}
            source={{ uri: 'https://0rdg6.zappar.io/0rdg6/4869346714061923988/1.0/' }} 
        />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 15,
    paddingTop: 0,
    paddingBottom: 24,
    backgroundColor: colors.white,
  },
});

export default Vto;
