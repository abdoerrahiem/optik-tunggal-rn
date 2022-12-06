import { useRoute } from '@react-navigation/core';
import React from 'react';
import { RefreshControl, StyleSheet, useWindowDimensions } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { colors } from '../../../lib/styles';
import { useAppNavigation } from '../../../router/RootNavigation';
import { Typography } from '../../../ui-shared/components';

function Terms() {
  // Hooks
  const navigation = useAppNavigation();
  const route = useRoute();
  const { width } = useWindowDimensions();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Typography>
        {`Et natus architecto tempora laborum ut dolores nihil distinctio voluptas. Reprehenderit corrupti quam. Eum sint commodi mollitia. Facilis officia ex sint. Consequuntur autem at corporis.
\n
Quia voluptas sunt veniam beatae quo tempora. Magnam sed fuga ut sit eos ipsam hic esse maxime. Dolor in consequatur consectetur.
\n
Atque assumenda voluptatem mollitia aspernatur qui quos deleniti error quo. Dolores quo quam autem omnis quidem. Accusamus magnam velit perferendis velit occaecati nisi sed. Aut earum qui doloremque corporis consequatur doloremque sit quo omnis.`}
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

export default Terms;
