import React, { FunctionComponent } from 'react';
import { Pressable, PressableProps, StyleProp, StyleSheet, View, ViewProps, ViewStyle } from 'react-native';
import { buttonRippleConfig } from './Button';
import { isPlatformOS } from '../../lib/config';

type Props = PressableProps & {
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  containerProps?: ViewProps;
  opacity?: boolean | number;
};

const PressableBox: FunctionComponent<Props> = ({
  containerStyle,
  containerProps,
  opacity = false,
  style,
  ...props
}) => {
  // Vars
  const opacityDimm = 'number' === typeof opacity ? opacity : 0.5;

  return (
    <View style={[styles.container, containerStyle]} {...containerProps}>
      <Pressable
        style={({ pressed }) => {
          let dimm = !isPlatformOS('ios') || !pressed;

          if (opacity) {
            dimm = !pressed;
          }

          return [
            styles.pressable,
            style,
            {
              opacity: dimm ? 1 : opacityDimm,
            }
          ];
        }}
        android_ripple={opacity ? undefined : {
          ...buttonRippleConfig,
        }}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderRadius: 6,
    marginHorizontal: -6,
  },

  pressable: {
    paddingHorizontal: 6,
  },
});

export type { Props as PressableBoxProps };

export default PressableBox;
