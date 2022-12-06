import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, ViewProps, ViewStyle } from 'react-native';
import { colors, ColorVariant } from '../../lib/styles';
import * as Animatable from 'react-native-animatable'

type Props = Animatable.AnimatableProperties<ViewStyle> & ViewProps & {
  progress?: number;
  color?: ColorVariant;
  containerStyle?: ViewStyle;
};

function ProgressBar({
  progress = 0,
  color = 'primary',
  containerStyle,
  transition = 'width',
  style,
  ...props
}: Props) {
  // States
  const [current, setCurrent] = useState<number>(0);

  // Effects
  useEffect(() => {
    setCurrent(progress);
  }, [progress]);

  return (
    <View style={[styles.progressBar, containerStyle]}>
      <Animatable.View
        style={[
          styles.progressLen,
          {
            backgroundColor: colors.fromVariant(color),
            width: `${current}%`
          },
          style,
        ]}
        transition={transition}
        easing="linear"
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  progressBar: {
    width: '100%',
    height: 16,
    overflow: 'hidden',
    borderRadius: 16,
    backgroundColor: colors.gray[300],
  },
  progressLen: {
    width: '0%',
    height: 16,
  },

});

export default ProgressBar;
