import { useRoute } from '@react-navigation/core';
import React from 'react';
import { RefreshControl, StyleSheet, useWindowDimensions } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { colors } from '../../../lib/styles';
import { useAppNavigation } from '../../../router/RootNavigation';
import { Typography } from '../../../ui-shared/components';

function PrivacyPolicy() {
  // Hooks
  const navigation = useAppNavigation();
  const route = useRoute();
  const { width } = useWindowDimensions();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Typography>
        {`Beatae ut aut vero dignissimos. Sunt animi consequatur sunt commodi enim earum et ea. Non asperiores sed consectetur occaecati aut suscipit sit. Nihil ea dolores consequuntur libero ratione quibusdam mollitia dolore.
\n
Odio neque adipisci qui quia doloribus nobis natus in. Voluptate saepe nostrum aut magnam quibusdam. Eum aspernatur officia neque optio a.
\n
Quas laborum fugiat aut accusantium eum eaque dolores. Voluptas minima illum et et ut et. Blanditiis a minus quod sit consequatur.`}
      </Typography>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 15,
    paddingTop: 8,
    paddingBottom: 24,
    backgroundColor: colors.white,
  },
});

export default PrivacyPolicy;
