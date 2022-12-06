import React, { ReactNode } from 'react';
import { StyleSheet, TextStyle, View, ViewProps, ViewStyle } from 'react-native';
import { colors, ColorVariant, wrapper } from '../../lib/styles';
import Typography, { TypographyProps } from './Typography';

type Props = ViewProps & {
  label?: ReactNode;
  labelProps?: TypographyProps;
  labelStyle?: TextStyle;

  color?: ColorVariant;
  containerStyle?: ViewStyle;
  backgroundStyle?: ViewStyle;

  left?: ReactNode;
  right?: ReactNode;
};

function BadgeDiscount({
  label,
  labelProps,
  labelStyle,
  color = 'transparent',
  left,
  right,
  containerStyle,
  backgroundStyle,
  style,
  children,
  ...props
}: Props) {
  return (
    <View style={[
      styles.container,
      containerStyle
    ]} {...props}>
      <View style={[styles.wrapper, style]}>
        <View style={[
          styles.background,
          { backgroundColor: colors.fromVariant(color) },
          backgroundStyle
        ]} />

        {'function' === typeof left ? left() : left}

        {!label ? children : (
          <Typography
            style={[
              styles.label,
              { color: colors.fromVariant(color, true) },
              labelStyle
            ]}
            heading
            textAlign="right"
            size="sm"
            {...labelProps}
          >{label}</Typography>
        )}

        {'function' === typeof right ? right() : right}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 5
  },
  wrapper: {
    ...wrapper.row,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  label: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },

  background: {
    position: 'absolute',
    top: 0,
    bottom: -20,
    left: 0,
    right: -20,
    borderRadius: 20,
  }
});

export default BadgeDiscount;
