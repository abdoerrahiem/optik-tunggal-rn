import * as React from 'react';
import { StatusBar, StatusBarProps } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { colors } from '../../lib/styles';

type Props = StatusBarProps & {

};

function FocusAwareStatusBar({
  ...props
}: Props) {
  const isFocused = useIsFocused();

  return !isFocused ? null : (
    <StatusBar
      backgroundColor={colors.palettes.primary}
      {...props}
    />
  );
}

export default FocusAwareStatusBar;
