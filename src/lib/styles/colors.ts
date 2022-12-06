import { default as _get } from 'lodash/get';

export type ColorVariant = 'transparent' | 'primary' | 'secondary' | 'accent' | 'success' | 'info' | 'danger' | 'dark' | keyof typeof palettes | string | number;

export type Colors = {
  transparent: (color: string, opacity: number) => string;
  fromVariant: (color: ColorVariant, contrastText?: boolean) => string;

  palettes: {
    [key: string]: string;
  };
  gray: {
    [key: string]: string;
  };
  variant: {
    [key: string]: string;
  };

  white: string;
  black: string;
  text: string;
};

const palettes = {
  primary: '#799FCB',
  primaryText: '#FFFFFF',
  secondary: '#FC6363',
  accent: '#5C5B5C',

  white: '#ffffff',
  black: '#000000',

  red: '#FF0000',
  green: '#5F9117',
  blue: '#5698E2',
  skyblue: '#DFE9F5',
  pink: '#FAC9C9',
  brown: '#BF7937',
  chocolate: '#BF7937', // same as brown
  yellow: '#FFDE00',
  orange: '#F7931E',
  gold: '#FFCB05',
};

const colors: Colors = {
  /**
   * Transform hex color to its certain transparency
   * 
   * @param {string} color Hex color
   * @param {float} opacity Opacity amount between 0-1. e.g. 0.75
   * @returns 
   */
  transparent: (color, opacity = 0) => {
    const intValue = Math.round(opacity * 255);
    const hexValue = intValue.toString(16).padStart(2, '0').toUpperCase();

    return _get(colors, color, color) + hexValue;
  },
  fromVariant: (variant: ColorVariant, contrastText = false) => {
    switch (variant) {
      case 'primary':
        return contrastText ? colors.white : colors.palettes.primary;
      case 'secondary':
        return contrastText ? colors.white : colors.palettes.secondary;
      case 'accent':
        return contrastText ? colors.white : colors.palettes.accent;
      case 'success':
        return contrastText ? colors.white : colors.palettes.green;
      case 'info':
        return contrastText ? colors.white : colors.palettes.blue;
      case 'danger':
        return contrastText ? colors.white : colors.palettes.red;
      case 'dark':
        return contrastText ? colors.white : colors.gray[800];
    };

    return contrastText ? colors.gray[950] : (
      colors.palettes[variant] || colors.gray[variant] || colors.variant[variant] || 'transparent'
    );
  },

  white: palettes.white,
  black: palettes.black,
  text: '#323232',
  palettes: {
    ...palettes,
  },
  gray: {
    50: '#fefefe',
    100: '#fafafa',
    200: '#f3f3f3',
    300: '#eeeeee',
    400: '#dbdbdb',
    500: '#bbbbbb',
    600: '#9e9e9e',
    700: '#888888',
    800: '#5C5C5C',
    900: '#323232',
    950: '#212121',
  },
  variant: {
    error: palettes.red,
    warning: palettes.yellow,
    success: palettes.green,
    info: palettes.blue,
  },
};

export default colors;
