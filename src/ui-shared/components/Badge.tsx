import React, { ReactNode } from 'react';
import { StyleSheet, TextStyle, View, ViewProps } from 'react-native';
import { TypographyProps } from '.';
import { colors, wrapper, ColorVariant } from '../../lib/styles';
import Typography from './Typography';

type Props = ViewProps & {
  label?: ReactNode;
  labelProps?: TypographyProps;
  labelStyle?: TextStyle;

  color?: ColorVariant;

  left?: ReactNode;
  right?: ReactNode;
};

const Badge = ({
  label,
  labelProps,
  labelStyle,
  color = 'transparent',
  left,
  right,
  style,
  children,
  ...props
}: Props) => {
  return (
    <View style={[
      styles.container,
      { backgroundColor: colors.fromVariant(color) },
      style
    ]} {...props}>
      {'function' === typeof left ? left() : left}

      {!label ? children : (
        <Typography style={[
          styles.label,
          { color: colors.fromVariant(color, true) },
          labelStyle
        ]} {...labelProps}>{label}</Typography>
      )}

      {'function' === typeof right ? right() : right}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...wrapper.row,
    alignItems: 'center',
  },
  label: {
    fontSize: 10,
  }
});

export type { Props as BadgeProps };

export default Badge;
