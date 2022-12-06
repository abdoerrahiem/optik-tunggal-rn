import React from 'react';
import { StyleSheet, useWindowDimensions, View, ViewProps } from 'react-native';
import { colors, wrapper } from '../../lib/styles';
import { BoxLoading } from '../../ui-shared/loadings';

type Props = ViewProps & {
  count?: number;
};

function BrandLoading({
  count = 2,
  style,
  ...props
}: Props) {
  // Hooks
  const { width } = useWindowDimensions();

  return (
    <View style={[styles.container, style]}>
      {Array.from(Array(count)).map((item, index) => (
        <View key={index} style={styles.productCard}>
          <BoxLoading width={width / 2} height={100} />
          <BoxLoading width={width / 2} height={100} style={{ marginTop: 10 }} />
          <BoxLoading width={width / 2} height={100} style={{ marginTop: 10 }} />
          <BoxLoading width={width / 2} height={100} style={{ marginTop: 10 }} />
          <BoxLoading width={width / 2} height={100} style={{ marginTop: 10 }} />
          <BoxLoading width={width / 2} height={100} style={{ marginTop: 10 }} />
          <BoxLoading width={width / 2} height={100} style={{ marginTop: 10 }} />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...wrapper.row,
    marginHorizontal: 10,
  },

  productCard: {
    flex: 1,
    overflow: 'hidden',
    width: '100%',
    marginHorizontal: 10,
    borderRadius: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.gray[200]
  },
  productCardContent: {
    paddingTop: 12,
    paddingHorizontal: 10,
    paddingVertical: 10,
    paddingBottom: 20,
  }
});

export default BrandLoading;
