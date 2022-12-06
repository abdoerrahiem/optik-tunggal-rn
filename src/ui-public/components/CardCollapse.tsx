import React, { createRef, useState } from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { PressableBox, Typography, TypographyProps } from '../../ui-shared/components';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, wrapper } from '../../lib/styles';
import * as Animatable from 'react-native-animatable';

type Props = ViewProps & {
  header?: string | React.ReactNode;
  headerProps?: TypographyProps;
  content?: string | React.ReactNode;
  contentProps?: TypographyProps;
};

function CardCollapse({
  style,
  header,
  headerProps,
  content,
  contentProps,
  children,
  ...props
}: Props) {
  // States
  const [collapse, setCollapse] = useState<boolean>(false);
  const [contentHi, setContentHi] = useState<number>(0);

  return (
    <View style={[styles.container, style]} {...props}>
      <PressableBox
        containerStyle={{ marginHorizontal: 0, overflow: 'visible' }}
        style={{
          ...wrapper.row,
          paddingVertical: 12,
          paddingHorizontal: 15,
        }}
        onPress={() => setCollapse(!collapse)}
      >
        <View style={{ flex: 1, marginRight: 15, alignSelf: 'center' }}>
          {'string' === typeof header ? (
            <Typography {...headerProps}>{header}</Typography>
          ) : header}
        </View>

        <Ionicons
          name={!collapse ? 'chevron-forward' : 'chevron-up'}
          size={18}
          color={colors.palettes.primary}
        />
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
          style={styles.content}
        >
          {!children ? (
            <Typography {...contentProps}>{content}</Typography>
          ) : children}
        </View>
      </Animatable.View>
    </View>
  )
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderColor: colors.transparent('palettes.primary', 0.25),
  },

  contentWrapper: {
    overflow: 'hidden',
    height: 0,
  },
  content: {
    position: 'absolute',
    paddingTop: 8,
    paddingHorizontal: 15,
    paddingBottom: 15,
    width: '100%',
  },
});

export default CardCollapse;
