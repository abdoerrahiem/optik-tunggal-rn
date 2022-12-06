import React, { FunctionComponent } from 'react'
import { StyleProp, StyleSheet, Text, TextProps, TextStyle } from 'react-native';
import { colors, fontFamily, typography } from '../../lib/styles';

type Props = TextProps & {
  type?: 'p' | 'h' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'display1' | 'display2' | 'display3';
  size?: 'default' | 'lg' | 'md' | 'sm' | 'xs' | 'xxs';
  color?: string | number;
  weight?: string | number;
  heading?: boolean;
  textAlign?: "auto" | "left" | "right" | "center" | "justify";
};

const Typography: FunctionComponent<Props> = ({
  type = 'p',
  size = 'default',
  color = 'default',
  weight,
  textAlign,
  heading = false,
  style,
  ...props
}) => {
  // Styles
  const textStyles: StyleProp<TextStyle> = [
    styles.text,
    !typography[type] ? null : typography[type],
    !heading ? null : { fontFamily: fontFamily.heading.default },
    !textAlign ? null : { textAlign },
  ];

  if (weight) {
    type FontGroup = {
      [key: string | number]: string;
    };

    const fontGroup: FontGroup = fontFamily[heading ? 'heading' : 'regular'];
    const fontValue = fontGroup[weight];

    fontValue && textStyles.push({ fontFamily: fontValue });
  }

  if (color !== 'default') {
    let colorValue = color;

    colors.gray[color] && (colorValue = colors.gray[color]);
    colors.palettes[color] && (colorValue = colors.palettes[color]);

    textStyles.push({ color: colorValue as string });
  }

  switch (size) {
    case 'lg':
      textStyles.push(typography.sizeLg);
      break;
    case 'md':
      textStyles.push(typography.sizeMd);
      break;
    case 'sm':
      textStyles.push(typography.sizeSm);
      break;
    case 'xs':
      textStyles.push(typography.sizeXs);
      break;
    case 'xxs':
      textStyles.push(typography.sizeXxs);
      break;
  }

  return (
    <Text style={[textStyles, style]} {...props} />
  );
};

const styles = StyleSheet.create({
  text: {
    ...typography.p,
    color: colors.text,
  },
});

export type { Props as TypographyProps };

export default Typography;
