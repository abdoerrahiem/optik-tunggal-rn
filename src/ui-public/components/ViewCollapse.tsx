import React, { createRef, useState } from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { PressableBox, Typography, TypographyProps } from '../../ui-shared/components';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, wrapper } from '../../lib/styles';
import * as Animatable from 'react-native-animatable';
import { PressableBoxProps } from '../../ui-shared/components/PressableBox';

type Props = ViewProps & {
  collapse?: boolean;
  pressableProps?: PressableBoxProps;
  header?: string | React.ReactNode;
  headerProps?: TypographyProps;
  content?: string | React.ReactNode;
  contentProps?: TypographyProps;
};

function ViewCollapse({
  style,
  collapse: initialCollapse = false,
  pressableProps,
  header,
  headerProps,
  content,
  contentProps,
  children,
  ...props
}: Props) {
  // States
  const [collapse, setCollapse] = useState<boolean>(initialCollapse);
  const [contentHi, setContentHi] = useState<number>(0);

  // Vars
  const {
    containerStyle: pressableContaienrStyle,
    style: pressableStyle,
    ...restPressableProps
  } = pressableProps || {};

  return (
    <View style={[styles.container, style]} {...props}>
      <PressableBox
        containerStyle={[{ marginHorizontal: 0 }, pressableContaienrStyle]}
        style={[{ paddingHorizontal: 0 }, pressableStyle]}
        {...restPressableProps}
        onPress={() => setCollapse(!collapse)}
      >
        {'string' === typeof header ? (
          <View style={[wrapper.row, { paddingVertical: 12 }]}>
            <View style={{ flex: 1, marginRight: 15, alignSelf: 'center' }}>
              {'string' === typeof header ? (
                <Typography {...headerProps}>{header}</Typography>
              ) : header}
            </View>

            <Ionicons
              name={!collapse ? 'chevron-forward' : 'chevron-down'}
              size={18}
              color={'#0d674e'}
            />
          </View>
        ) : header}
      </PressableBox>

      <Animatable.View
        style={[
          styles.contentWrapper,
          { height: !collapse ? 0 : contentHi },
        ]}
        duration={250}
        transition="height"
        easing="ease-in-out"
      >
        <View
          onLayout={({ nativeEvent: { layout } }) => {
            const { height } = layout;

            setContentHi(height);
          }}
          style={{ position: 'absolute', width: '100%' }}
        >
          {!children ? (
            <View style={styles.content}>
              <Typography {...contentProps}>{content}</Typography>
            </View>
          ) : children}
        </View>
      </Animatable.View>
    </View>
  )
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },

  contentWrapper: {
    overflow: 'hidden',
    height: 0,
  },
  content: {
    paddingTop: 8,
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
});

export default ViewCollapse;
