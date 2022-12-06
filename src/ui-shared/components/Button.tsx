import React, { FunctionComponent, ReactNode } from 'react';
import { ActivityIndicator, Platform, Pressable, PressableProps, StyleProp, StyleSheet, TextProps, TextStyle, View, ViewStyle } from 'react-native';
import { colors, shadows, wrapper } from '../../lib/styles';
import Typography, { TypographyProps } from './Typography';

type Props = PressableProps & {
  style?: ViewStyle;
  label?: string;
  color?: 'transparent' | 'primary' | 'secondary' | 'success' | 'info' | 'danger' | 'dark' | 'yellow';
  size?: 'default' | 'sm' | 'lg' | number;
  type?: 'default' | 'opacity';
  border?: boolean | string;
  rounded?: boolean | number;
  shadow?: keyof typeof shadows;
  left?: ReactNode;
  right?: ReactNode;
  fullWidth?: false;
  opacity?: boolean | number;
  loading?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  labelProps?: TypographyProps;
};

const Button = React.forwardRef<View, Props>(({
  children,
  label,
  size = 'default',
  color = 'transparent',
  type = 'default',
  disabled = false,
  fullWidth = false,
  rounded = true,
  border = false,
  loading = false,
  shadow,
  left,
  right,
  style,
  containerStyle,
  labelStyle,
  labelProps,
  opacity = false,
  ...props
}, ref) => {
  // Vars
  let useOpacity = 'opacity' === type;
  let dimmOpacity = 0.66;

  if (opacity !== false) {
    useOpacity = true;
    dimmOpacity = 'number' === typeof opacity ? opacity : dimmOpacity;
  }

  const containerStyles: StyleProp<ViewStyle> = [
    styles.container,
    size !== 'sm' ? null : styles.containerSm,
    size !== 'lg' ? null : styles.containerLg,
    rounded === false ? null : {
      borderRadius: 'number' === typeof rounded ? rounded : (
        'number' === typeof size ? size / 4 : 100
      )
    },
    !border ? null : styles.containerBorder,
    'number' !== typeof shadow ? null : {
      ...shadows[shadow],
    },
  ];

  const buttonStyles: StyleProp<ViewStyle> = [
    styles.button,
    !border ? null : styles.buttonBorder,
    size !== 'sm' ? null : styles.sizeSm,
    size !== 'lg' ? null : styles.sizeLg,
    'number' !== typeof size ? null : { width: size, height: size, ...styles.hasSize },
    color !== 'primary' ? null : styles.buttonPrimary,
    color !== 'secondary' ? null : styles.buttonSecondary,
    color !== 'info' ? null : styles.buttonInfo,
    color !== 'success' ? null : styles.buttonSuccess,
    color !== 'danger' ? null : styles.buttonDanger,
    color !== 'yellow' ? null : styles.buttonYellow,
    color !== 'dark' ? null : styles.buttonDark,
    color !== 'transparent' ? null : styles.buttonTransparent,
  ];

  const labelPropsDefault: TypographyProps = {
    type: 'h',
    size: 'default',
    textAlign: 'center',
    ...(size !== 'sm' ? null : { type: 'p' }),
    ...(size !== 'lg' ? null : { size: 'default' }),
    ...(color !== 'primary') ? null : { color: 'white' },
    ...(color !== 'secondary') ? null : { color: 'white' },
    ...(color !== 'info') ? null : { color: 'white' },
    ...(color !== 'success') ? null : { color: 'white' },
    ...(color !== 'danger') ? null : { color: 'white' },
    ...(color !== 'yellow') ? null : { color: 950 },
    ...(color !== 'transparent') ? null : { color: 950 },
    ...(color !== 'dark') ? null : { color: 'white' },
  };

  if (type === 'opacity' || useOpacity) {
    useOpacity = true;
  } else if (Platform.OS === 'android' && !props.android_ripple) {
    props.android_ripple = buttonRippleConfig;
  } else {
    useOpacity = true;
  }

  if (disabled || loading) {
    containerStyles.push(styles.noShadow);
    buttonStyles.push(styles.buttonDisabled);
    labelPropsDefault.color = 800;
  }

  if ('transparent' === color) {
    containerStyles.push(styles.noShadow);
  }

  if (fullWidth) {
    containerStyles.push(styles.fullWidth);
    buttonStyles.push(styles.fullWidth);
  }

  if (border && 'boolean' !== typeof border) {
    const borderColor = colors.palettes[border] || colors.gray[border] || border;

    containerStyles.push({ borderColor });

    if (color === 'transparent') {
      labelPropsDefault.color = borderColor;
    }
  }

  return (
    <View style={[containerStyles, containerStyle]}>
      <Pressable
        ref={ref}
        style={({ pressed }): StyleProp<ViewStyle> => [
          ...buttonStyles,
          style,
          {
            opacity: (!useOpacity || !pressed) ? 1 : dimmOpacity,
          }
        ]}
        disabled={disabled || loading}
        {...props}
      >
        {!left ? null : left}

        {!label ? null : (
          <Typography
            style={[labelStyle]}
            {...labelPropsDefault}
            {...labelProps}
          >{label}</Typography>
        )}

        {children}

        {!right ? null : right}

        <View style={[
          styles.spinnerContainer,
          !loading ? null : { opacity: 1 }
        ]}>
          <ActivityIndicator
            size={size === 'sm' ? 'small' : 'small'}
            color={colors.white}
          />
        </View>
      </Pressable>
    </View>
  )
});

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    overflow: 'hidden',
    backfaceVisibility: 'hidden',
  },

  containerSm: {
    borderRadius: 6,
  },
  containerLg: {
    borderRadius: 12,
  },

  containerBorder: {
    borderWidth: 1,
    borderColor: colors.gray[400],
    justifyContent: 'center'
  },

  noShadow: {
    elevation: 0,
  },
  fullWidth: {
    width: '100%',
  },

  button: {
    ...wrapper.row,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    paddingHorizontal: 16,
    // backgroundColor: colors.gray[500],
  },

  buttonPrimary: {
    backgroundColor: colors.palettes.primary,
  },
  buttonSecondary: {
    backgroundColor: colors.palettes.secondary,
  },
  buttonInfo: {
    backgroundColor: colors.palettes.blue,
  },
  buttonSuccess: {
    backgroundColor: colors.palettes.green,
  },
  buttonDanger: {
    backgroundColor: colors.palettes.red,
  },
  buttonYellow: {
    backgroundColor: colors.palettes.yellow,
  },
  buttonDark: {
    backgroundColor: colors.gray[800],
  },
  buttonDisabled: {
    backgroundColor: colors.gray[400],
  },
  buttonTransparent: {
    backgroundColor: 'transparent',
  },

  buttonBorder: {
    minWidth: 48,
  },

  hasSize: {
    minWidth: 0,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  sizeSm: {
    paddingVertical: 5,
    paddingHorizontal: 16,
  },
  sizeLg: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },

  spinnerContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0,
  }
});

export const buttonRippleConfig = {
  color: colors.transparent(colors.black, 0.1),
};

export type { Props as ButtonProps };

export default Button;
