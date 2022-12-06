import React from 'react';
import { StyleSheet, useWindowDimensions, View, ViewProps } from 'react-native';
import { colors, wrapper } from '../../lib/styles';
import { BoxLoading } from '../../ui-shared/loadings';

type Props = ViewProps & {
  count?: number;
};

function ProductsLoading({
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
          <BoxLoading width={width / 2} height={144} />

          <View style={styles.productCardContent}>
            <BoxLoading width={[120, 100]} height={16} />

            <BoxLoading width={[100, 80]} height={16} style={{ marginTop: 4 }} />
          </View>
        </View>
        
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...wrapper.row,
    marginHorizontal: -6,
  },

  productCard: {
    flex: 1,
    overflow: 'hidden',
    width: '100%',
    marginHorizontal: 6,
    marginVertical: 5,
    borderRadius: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.gray[200]
  },
  productCardContent: {
    paddingTop: 12,
    paddingHorizontal: 15,
    paddingBottom: 20,
  }
});

export default ProductsLoading;
