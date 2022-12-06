import React from 'react';
import { TextInput } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Button, { ButtonProps } from './Button';
import TextField, { TextFieldProps } from './TextField';
import { colors } from '../../lib/styles';

type Props = TextFieldProps & {
  buttonProps?: ButtonProps;
  leftButtonProps?: ButtonProps;
  rightButtonProps?: ButtonProps;

  onIncrease?: () => void;
  onDecrease?: () => void;
};

const TextFieldNumber = React.forwardRef<TextInput, Props>(({
  buttonProps,
  leftButtonProps,
  rightButtonProps,
  style,
  onIncrease,
  onDecrease,
  ...props
}: Props, ref) => {
  return (
    <TextField
      ref={ref}
      editable={false}
      keyboardType="number-pad"
      style={[{ textAlign: 'center' }, style]}
      left={(
        <Button
          size={24}
          rounded={4}
          onPress={onDecrease}
          {...buttonProps}
          {...leftButtonProps}
        >
          <Ionicons name="remove" size={16} color={colors.gray[700]} />
        </Button>
      )}
      right={(
        <Button
          size={24}
          rounded={4}
          onPress={onIncrease}
          {...buttonProps}
          {...rightButtonProps}
        >
          <Ionicons name="add" size={16} color={colors.gray[700]} />
        </Button>
      )}
      {...props}
    />
  )
});

export default TextFieldNumber;
