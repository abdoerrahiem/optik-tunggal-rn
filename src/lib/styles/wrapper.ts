import { StyleSheet, ViewStyle } from 'react-native';

const gutterWidth = 15;

const gutters: ViewStyle = {
  paddingHorizontal: gutterWidth,
};

const stretch: ViewStyle = {
  alignSelf: 'stretch',
};

const wrapper = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  gutters: gutters,
  halfGutters: {
    paddingHorizontal: gutterWidth,
  },
  stretch: stretch,
  stretchGutters: {
    ...stretch,
    ...gutters,
  },
  noGutters: {
    paddingStart: 0,
    paddingEnd: 0,
  },
});

export default wrapper;
