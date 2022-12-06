import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Pressable, useWindowDimensions, ViewProps } from 'react-native';
import { colors, wrapper } from '../../lib/styles';
import Ionicons from 'react-native-vector-icons/Ionicons';

type Props = ViewProps & {
  value?: number;
  size?: number;
  editable?: boolean;
  onChange?: (value: number) => void;
  icons?: string[];
};

const RatingStars = ({
  value,
  size,
  editable = false,
  onChange,
  style,
  icons = ['star', 'star'],
  ...props
}: Props) => {
  // States
  const [rate, setRate] = useState(value || 0);

  // Effects
  useEffect(() => {
    undefined !== value && setRate(value);
  }, [value]);

  // Vars
  const { width } = useWindowDimensions();
  const stars = [1, 2, 3, 4, 5];
  const starSize = ((width - 72) / 5) - 8;

  const handleRateChange = (value: number) => {
    if (editable) {
      setRate(value);
      
      'function' === typeof onChange && onChange(value);
    }
  };

  return (
    <View style={[styles.container, style]} {...props}>
      <View style={styles.stars}>
        {stars.map((item) => {
          const color = item <= rate ? colors.palettes.gold : colors.gray[500];

          return (
            <Pressable
              key={item}
              style={styles.starItem}
              onPress={() => handleRateChange(item)}
            >
              <Ionicons
                name={item <= rate ? icons[0] : icons[1]}
                size={size || starSize}
                color={color}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },

  stars: {
    ...wrapper.row,
    justifyContent: 'space-evenly'
  },
  starItem: {
    flexGrow: 1,
    alignItems: 'center',
  },
});

export default RatingStars;
