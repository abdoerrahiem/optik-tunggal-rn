import React, { FunctionComponent } from 'react';
import { StyleSheet, View, ViewProps, ViewStyle } from 'react-native';
import { colors, wrapper } from '../../lib/styles';

type Props = ViewProps & {
  containerStyle?: ViewStyle;
  size?: number;
  dotCount: number;
  activeIndexes?: number[];
  color?: string;
};

function CarouselDots({
  dotCount,
  activeIndexes = [],
  color = '#0d674e',
  size = 10,
  containerStyle,
  style,
  ...props
}: Props) {
  return (
    <View style={[styles.carouselDots, containerStyle]} {...props}>
      {Array.from(Array(dotCount)).map((item, index) => (
        <View
          key={index}
          style={[
            styles.carouselDot,
            style,
            {
              backgroundColor: activeIndexes.indexOf(index) < 0 ? 'transparent' : color,
              borderColor: color,
            },
          ]} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  carouselDots: {
    ...wrapper.row,
    justifyContent: 'center',
    width: '100%',
  },
  carouselDot: {
    width: 10,
    height: 10,
    borderWidth: 1,
    borderColor: colors.gray[700],
    borderRadius: 16,
    marginHorizontal: 4,
  },
});

export default CarouselDots;
