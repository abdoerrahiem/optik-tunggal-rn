import React from 'react';
import { Platform, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Modal, { Direction, ModalProps } from 'react-native-modal';
import { TypographyProps } from '.';
import { colors } from '../../lib/styles';
import Typography from './Typography';

type Props = Partial<Omit<ModalProps, 'swipeDirection'>> & {
  title?: string;
  titleProps?: StyleProp<TypographyProps>;
  children?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  swipeDirection?: Direction | Direction[] | null;
};

const BottomDrawer = ({
  title,
  titleProps,
  children,
  containerStyle,
  style,
  animationIn,
  swipeDirection = 'down',
  ...props
}: Props) => {
  return (
    <Modal
      animationIn="slideInUp"
      swipeDirection={swipeDirection === null ? undefined : swipeDirection}
      style={[styles.container, containerStyle]}
      useNativeDriverForBackdrop
      {...props}
    >
      <View style={[
        styles.card,
        {
          paddingTop: !swipeDirection ? 24 : 0,
        },
        style
      ]}>
        {!swipeDirection ? null : (
          <View style={[styles.dragIcon, {
            backgroundColor: colors.gray[400],
            marginBottom: 24,
          }]} />
        )}

        {!title ? null : (
          <Typography type="h3" color="primary" textAlign="center" style={styles.title} {...titleProps}>
            {title}
          </Typography>
        )}

        {children}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: colors.palettes.white,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    paddingBottom: Platform.OS === 'ios' ? 34 : 0,
  },

  dragIcon: {
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 24,
    width: 36,
    height: 5,
    borderRadius: 5,
  },

  title: {
    paddingHorizontal: 24,
    paddingBottom: 12,
  }
});

export type { Props as BottomDrawerProps };

export default BottomDrawer;