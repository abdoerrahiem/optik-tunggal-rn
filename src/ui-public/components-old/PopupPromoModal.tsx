import React, { useState } from 'react';
import { BottomDrawer, BottomDrawerProps, Button, ImageAuto, PressableBox, RenderHtml, Typography } from '../../ui-shared/components';
import { default as POPUPS } from '../../assets/popup';
import { Image, Linking, Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { colors, shadows, wrapper } from '../../lib/styles';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { PopupModel } from '../../types/model';

type Props = BottomDrawerProps & {
  Promotions: PopupModel[];
  onComplete?: () => void;
};

function PopupPromoModal({
  Promotions,
  onComplete,
  style,
  ...props
}: Props) {
  // Hooks
  const { width, height } = useWindowDimensions();

  // States
  const [step, setStep] = useState<number>(0);

  // Vars
  // Promotions = POPUPS;

  const handlePromotionNext = () => {
    const nextStep = step + 1;

    if (nextStep >= Promotions.length) {
      setTimeout(() => {
        setStep(0);
      }, 1000);

      'function' === typeof onComplete && onComplete();

      return void(0);
    }

    setStep(nextStep);
  };

  const PromotionBgHeight = height * 0.7;

  return (
    <BottomDrawer
      style={[{
        height,
        paddingTop: 0,
        paddingBottom: 0,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
      }, style]}
      {...props}
    >
      {Promotions.map((item, index) => {
        return (
          <View
            key={index}
            style={[styles.PromotionMaster, {
              display: index === step ? 'flex' : 'none',
              minHeight: PromotionBgHeight,
            }]}
          >
            {!item.bg ? null : (
              <Image source={'string' === typeof item.bg ?  { uri: item.bg } : item.bg} style={styles.PromotionBg} />
            )}

            <PressableBox
              containerStyle={styles.PromotionContainer}
              style={styles.Promotion}
              opacity={1}
            >
              <View style={[styles.PromotionCard, { height: PromotionBgHeight }]} />

              <View style={[styles.PromotionContent, { minHeight: PromotionBgHeight - 30 }]}>
                {!item.image ? null : (
                  <View style={styles.PromotionImageContainer}>
                    <ImageAuto
                      source={'string' === typeof item.image ?  { uri: item.image } : item.image}
                      width={width - 60}
                      height={height/2}
                      style={styles.PromotionImage}
                    />
                  </View>
                )}

                <View style={{ marginTop: 'auto' }}>
                  {!item.title ? null : (
                    <Typography type="h5" color="primary" textAlign="center">
                      {item.title}
                    </Typography>
                  )}

                  {!item.subtitle ? null : (
                    <Typography heading textAlign="center" style={{ marginTop: 4 }}>
                      {item.subtitle}
                    </Typography>
                  )}

                  {!item.caption ? null : (
                    <Typography textAlign="center" style={{ marginTop: 4 }}>
                      {item.caption}
                    </Typography>
                  )}

                  {!item.html ? null : (
                    <View style={{ marginTop: 4 }}>
                      <RenderHtml contentWidth={width - 60} source={{ html: item.html }} />
                    </View>
                  )}

                  {!item.disclaimer ? null : (
                    <Typography heading size="sm" textAlign="center" style={{
                      marginTop: 16,
                      fontStyle: 'italic',
                    }}>
                      {item.disclaimer}
                    </Typography>
                  )}

                  {!item.actions?.length ? null : (
                    <View style={[wrapper.row, {
                      alignItems: 'flex-end',
                      justifyContent: 'space-between',
                      marginTop: 8,
                    }]}>
                      {item.actions?.map((action, i) => (
                        <PressableBox
                          key={i}
                          style={{ paddingHorizontal: 8, paddingVertical: 6 }}
                          onPress={() => !action.url ? void(0) : Linking.openURL(action.url)}
                        >
                          {!action.image ? null : (
                            <ImageAuto source={'string' === typeof action.image ?  { uri: action.image } : action.image} width={(width - 120) / (item.actions?.length || 3)} />
                          )}
                        </PressableBox>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            </PressableBox>
          </View>
        );
      })}

      <Button
        containerStyle={styles.PromotionClose}
        size={42}
        onPress={handlePromotionNext}
      >
        <Ionicons name="close" size={32} color={colors.white} />
      </Button>
    </BottomDrawer>
  );
};

const styles = StyleSheet.create({
  PromotionClose: {
    position: 'absolute',
    right: 15,
    top: Platform.OS === 'ios' ? 40 : 15,
  },

  PromotionMaster: {
    marginTop: -24,
    flexGrow: 1,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  PromotionContainer: {
    borderRadius: 15,
    marginHorizontal: 15,
    marginVertical: 15,
    overflow: 'visible',
    justifyContent: 'center',
    position: 'relative',
  },
  PromotionBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  Promotion: {
    position: 'relative',
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  PromotionCard: {
    ...shadows[3],
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    margin: 'auto',
    backgroundColor: colors.white,
    borderRadius: 15,
  },

  PromotionContent: {
    elevation: 4,
    position: 'relative',
  },
  PromotionImageContainer: {
    // 
  },
  PromotionImage: {
    resizeMode: 'contain',
  }
});

export default PopupPromoModal;
