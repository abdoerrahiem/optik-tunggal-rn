import React from 'react';
import Toast from 'react-native-easy-toast';
import { colors, typography } from '../../lib/styles';

const Toaster = ({
  ...props
}, ref) => {
  return (
    <Toast
      ref={ref}
      positionValue={50}
      style={{
        backgroundColor: colors.transparent('black', 0.66),
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
        maxWidth: '90%'
      }}
      textStyle={{
        ...typography.p,
        color: colors.palettes.white,
        textAlign: 'center',
      }}
      opacity={1}
      {...props}
    />
  );
};

export default React.forwardRef(Toaster);
