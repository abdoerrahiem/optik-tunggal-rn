import React from 'react'
import { StyleSheet, View } from 'react-native';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import Typography from './Typography';
import { colors } from '../../lib/styles';

const Slider = ({
  width = 280,
  style,
  labelFormatter,
  ...props
}) => {

  return (
    <View style={[styles.container, { width }, style]}>
      <MultiSlider
        sliderLength={width}
        selectedStyle={styles.barSelected}
        enabledOne={false}
        enabledTwo
        isMarkersSeparated
        customMarkerLeft={(e) => (
          <View style={styles.marker} currentValue={e.currentValue} />
        )}
        markerStyle={[styles.marker, styles.markerActive]}
        enableLabel
        customLabel={({
          oneMarkerLeftPosition,
          oneMarkerValue,
          twoMarkerLeftPosition,
          twoMarkerValue
        }) => (
          <View style={styles.labels}>
            <Typography style={[styles.label, { left: oneMarkerLeftPosition || 0 }]}>
              {'function' === typeof labelFormatter ? labelFormatter(oneMarkerValue) : oneMarkerValue}
            </Typography>

            <Typography style={[styles.label, { left: twoMarkerLeftPosition || 0 }]}>
              {'function' === typeof labelFormatter ? labelFormatter(twoMarkerValue) : twoMarkerValue}
            </Typography>
          </View>
        )}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    paddingBottom: 6,
  },
  marker: {
    borderWidth: 1,
    borderColor: colors.gray[400],
    backgroundColor: colors.palettes.white,
    width: 20,
    height: 20,
    borderRadius: 20,
  },
  markerActive: {
    backgroundColor: colors.palettes.primary,
    borderColor: colors.palettes.primary,
  },
  barSelected: {
    backgroundColor: colors.palettes.primary,
  },
  labels: {
    position: 'absolute',
    bottom: -6,
    left: 0,
    width: '100%',
  },
  label: {
    position: 'absolute',
    bottom: 0,
    width: 72,
    marginLeft: -36,
    textAlign: 'center',
  }
});

export default Slider;
