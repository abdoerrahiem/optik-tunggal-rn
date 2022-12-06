import React from 'react';
import Button, { ButtonProps } from './Button';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppNavigation } from '../../router/RootNavigation';
import { colors } from '../../lib/styles';
import { StyleSheet } from 'react-native';
import { useAppSelector } from '../../redux/hooks';
import Badge from './Badge';

function ButtonCart({
  ...props
}: ButtonProps) {
  // Hooks
  const navigation = useAppNavigation();
  const { cart_items } = useAppSelector(({ shop }) => shop);

  return (
    <Button
      containerStyle={{ marginLeft: 12, alignSelf: 'flex-start' }}
      size={42}
      color="transparent"
      onPress={() => navigation.navigatePath('Public', {
        screen: 'BottomTabs.CartStack.Cart'
      })}
      {...props}
    >
      <Ionicons name="cart-outline" size={24} color={colors.gray[900]} />

      {!cart_items?.length ? null : (
        <Badge
          style={styles.badge}
          color="red"
          label={cart_items.length}
          labelProps={{ size: 'xs' }}
          labelStyle={{ color: colors.white }}
        />
      )}
    </Button>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 16,
    paddingVertical: 0,
    paddingHorizontal: 2,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ButtonCart;
