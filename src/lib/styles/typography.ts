import { Platform, StyleSheet } from 'react-native';
import colors from './colors';

const regularFontFamily = Platform.OS === 'android' ? 'Poppins' : 'Poppins-Regular';
const headingFontFamily = 'Poppins-Bold';

const fontFamily = {
  icon: 'Poppins-Icon',
  regular: {
    default: regularFontFamily,
    100: 'Poppins-Thin',
    300: 'Poppins-Light',
    400: 'Poppins-Regular',
    500: 'Poppins-Medium',
    700: 'Poppins-Bold',
    900: 'Poppins-Black',
  },
  heading: {
    default: headingFontFamily,
    100: 'Poppins-Thin',
    300: 'Poppins-Light',
    400: 'Poppins-Regular',
    500: 'Poppins-Medium',
    700: 'Poppins-Bold',
    900: 'Poppins-Black',
  },
};

const sizeDefault = 14;

const styles = {
  // color: colors.text,
};

const heading = {
  ...styles,
  fontFamily: headingFontFamily,
};

const regular = {
  ...styles,
  fontFamily: regularFontFamily,
}

const typography = StyleSheet.create({
  heading,
  regular,

  p: {
    ...regular,
    fontSize: sizeDefault,
    lineHeight: sizeDefault * 1.33,
  },
  h: {
    ...heading,
    fontSize: sizeDefault,
    lineHeight: sizeDefault * 1.33,
  },

  display1: {
    fontSize: sizeDefault * 4,
    lineHeight: (sizeDefault * 4) * 1.025,
  },
  display2: {
    fontSize: sizeDefault * 2.5,
    lineHeight: (sizeDefault * 2.5) * 1.025,
  },
  display3: {
    fontSize: sizeDefault * 2,
    lineHeight: (sizeDefault * 2) * 1.025,
  },

  h1: {
    ...heading,
    fontSize: sizeDefault * 1.75,
    lineHeight: (sizeDefault * 1.75) * 1.125,
  },
  h2: {
    ...heading,
    fontSize: sizeDefault * 1.5,
    lineHeight: (sizeDefault * 1.5) * 1.125,
  },
  h3: {
    ...heading,
    fontSize: sizeDefault * 1.25,
    lineHeight: (sizeDefault * 1.25) * 1.25,
  },
  h4: {
    ...heading,
    fontSize: sizeDefault * 1.125,
    lineHeight: (sizeDefault * 1.125) * 1.33,
  },
  h5: {
    ...heading,
    fontSize: sizeDefault * 1.05,
    lineHeight: (sizeDefault * 1.05) * 1.33,
  },
  h6: {
    ...heading,
    fontSize: sizeDefault * 1,
    lineHeight: (sizeDefault * 1) * 1.33,
  },

  sizeLg: {
    fontSize: sizeDefault * 1.125,
    lineHeight: (sizeDefault * 1.125) * 1.33,
  },
  sizeMd: {
    fontSize: sizeDefault * 1.05,
    lineHeight: (sizeDefault * 1.05) * 1.33,
  },
  sizeSm: {
    fontSize: sizeDefault * .90,
    lineHeight: (sizeDefault * .90) * 1.33,
  },
  sizeXs: {
    fontSize: sizeDefault * .75,
    lineHeight: (sizeDefault * .75) * 1.5,
  },
  sizeXxs: {
    fontSize: sizeDefault * .65,
    lineHeight: (sizeDefault * .65) * 1.5,
  },

  alignLeft: {
    textAlign: 'left',
  },
  alignRight: {
    textAlign: 'right',
  },
  alignCenter: {
    textAlign: 'center',
  },
  alignJustify: {
    textAlign: 'justify',
  },
});

export {
  sizeDefault as fontSizeDefault,
  fontFamily
};

export default typography;
