import { useRoute } from '@react-navigation/core';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { colors, shadows } from '../../lib/styles';
import { useAppNavigation } from '../../router/RootNavigation';
import { Button, Typography } from '../../ui-shared/components';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppSelector } from '../../redux/hooks';

function Notification() {
  // Hooks
  const navigation = useAppNavigation();
  const route = useRoute();
  const { t } = useTranslation('notification');
  const { user } = useAppSelector(({ user }) => user);

  // States
  const [isLoading, setIsLoading] = useState(false);

  // Effects
  useEffect(() => {
    handleRefresh();
  }, []);

  // Vars
  const handleRefresh = async () => {
    setIsLoading(true);

    setIsLoading(false);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={(
        <RefreshControl
          refreshing={isLoading}
          onRefresh={handleRefresh}
          colors={[colors.palettes.primary]}
        />
      )}
    >
      {!user ? null : (
        <Button
          containerStyle={styles.actionBtnContainer}
          label={t('Transaction', { count: 2 })}
          labelProps={{ type: 'p', size: 'md' }}
          labelStyle={{ flex: 1, textAlign: 'left' }}
          size="lg"
          right={(
            <Ionicons name="chevron-forward" size={20} color='black' />
          )}
          onPress={() => navigation.navigatePath('Public', {
            // screen: 'BottomTabs.NotificationStack.TransactionList'
            screen: 'BottomTabs.NotificationStack.TransactionUsers',
          })}
        />
      )}

      <Button
        containerStyle={[styles.actionBtnContainer, { marginTop: 0 }]}
        label={t('Penawaran Eksklusif', { count: 2 })}
        labelProps={{ type: 'p', size: 'md' }}
        labelStyle={{ flex: 1, textAlign: 'left' }}
        size="lg"
        right={(
          <Ionicons name="chevron-forward" size={20} color='black' />
        )}
        onPress={() => navigation.navigatePath('Public', {
          screen: 'BottomTabs.NotificationStack.PromotionList'
        })}
      />

      <Button
        containerStyle={[styles.actionBtnContainer, { marginTop: 0 }]}
        label={t('Artikel', { count: 2 })}
        labelProps={{ type: 'p', size: 'md' }}
        labelStyle={{ flex: 1, textAlign: 'left' }}
        size="lg"
        right={(
          <Ionicons name="chevron-forward" size={20} color='black' />
        )}
        onPress={() => navigation.navigatePath('Public', {
          screen: 'News'
        })}
      />

      
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 15,
    paddingTop: 16,
    paddingBottom: 24,
    backgroundColor: colors.white,
  },

  actionBtnContainer: {
    backgroundColor: colors.white,
    borderRadius: 0,
    borderBottomWidth: 1,
    borderColor: colors.transparent('palettes.primary', 0.5),
  },
});

export default Notification;
