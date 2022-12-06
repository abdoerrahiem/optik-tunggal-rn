import React, { ReactNode } from 'react'
import { StyleProp, StyleSheet, TextInput, TextInputProps, View, ViewStyle } from 'react-native'
import Typography from './Typography';
import { colors, typography, wrapper } from '../../lib/styles';

type Props = TextInputProps & {
  containerStyle?: ViewStyle;
  size?: 'default' | 'lg' | 'sm';
  border?: boolean | 'bottom';
  rounded?: boolean | number;
  left?: ReactNode;
  right?: ReactNode;
  error?: boolean;
  message?: string;
  textAlignVertical?: string;
};

const TextField = React.forwardRef<TextInput, Props>(({
  containerStyle,
  size = 'default',
  border = 'bottom',
  rounded = false,
  left,
  right,
  style,
  error,
  message,
  textAlignVertical,
  ...props
}, ref) => {
  // Vars
  const containerStyles: StyleProp<ViewStyle> = [
    styles.container,
    size !== 'lg' ? null : styles.containerLg,
    size !== 'sm' ? null : styles.containerSm,
    !border ? null : (
      'bottom' === border ? styles.containerBorderBottom : styles.containerBorder
    ),
    !error ? null : styles.containerError,
    rounded === false ? null : { borderRadius: true === rounded ? 50 : rounded },
  ];

  return (
    <React.Fragment>
      <View style={[...containerStyles, containerStyle]}>
        {!left ? null : left}

        <View style={{ flex: 1 }}>
          <TextInput
            style={[
              styles.input,
              size !== 'lg' ? null : styles.inputLg,
              size !== 'sm' ? null : styles.inputSm,
              !textAlignVertical ? null : { textAlignVertical },
              !props.multiline ? null : {
                ...styles.inputMultiline,
                ...(size !== 'lg' ? null : styles.inputMultilineLg),
                ...(size !== 'sm' ? null : styles.inputMultilineSm),
              },
              style
            ]}
            placeholderTextColor={colors.gray[600]}
            ref={ref}
            {...props}
          />
        </View>

        {!right ? null : right}
      </View>

      {(!error || !message) ? null : (
        <View style={{ marginTop: 4 }}>
          <Typography size="sm" color="red">{message}</Typography>
        </View>
      )}
    </React.Fragment>
  );
});

const styles = StyleSheet.create({
  container: {
    ...wrapper.row,
    ...wrapper.halfGutters,
    alignItems: 'center',
    borderWidth: 0,
    borderColor: colors.transparent('palettes.primary', 0.25),
    padding: 0,
    overflow: 'hidden',
    borderRadius: 5,
    elevation: 4,
  },
  containerLg: {
    // 
  },
  containerSm: {
    paddingHorizontal: 10,
  },
  containerBorder: {
    elevation: 0,
    borderWidth: 1,
  },
  containerBorderBottom: {
    elevation: 0,
    borderBottomWidth: 1,
    borderRadius: 0,
    backgroundColor: colors.white,
    paddingHorizontal: 0,
  },
  containerError: {
    borderColor: 'red',
  },

  input: {
    ...typography.p,
    color: colors.black,
    paddingVertical: 5,
    paddingHorizontal: 8,
    margin: 0,
  },
  inputLg: {
    paddingVertical: 15,
    paddingHorizontal: 8,
  },
  inputSm: {
    fontSize: typography.sizeSm.fontSize,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },

  inputMultiline: {
    // 
  },
  inputMultilineLg: {
    // 
  },
  inputMultilineSm: {
    // 
  },
});

export type { Props as TextFieldProps };

export default TextField;
