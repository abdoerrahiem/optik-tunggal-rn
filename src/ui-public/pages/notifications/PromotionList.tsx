import { useRoute } from '@react-navigation/core';
import React, { useEffect, useState } from 'react';
import { Image, ListRenderItemInfo, RefreshControl, StyleSheet, useWindowDimensions, View } from 'react-native';
import { colors, shadows, wrapper } from '../../../lib/styles';
import { useAppNavigation } from '../../../router/RootNavigation';
import { Button, ImageAuto, PressableBox, RenderHtml, Typography } from '../../../ui-shared/components';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { FlatList } from 'react-native-gesture-handler';
import { Modelable, PromotionModel } from '../../../types/model';
import { BoxLoading } from '../../../ui-shared/loadings';
import { httpService } from '../../../lib/utilities';
import moment from 'moment';

function PromotionList() {
  // Hooks
  const navigation = useAppNavigation();
  const route = useRoute();
  const { t } = useTranslation('notification');
  const { width } = useWindowDimensions();

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [Promotion, setPromotion] = useState<Modelable<PromotionModel>>({
    models: [],
    modelsLoaded: false,
  });

  // Effects
  useEffect(() => {
    handleRefresh();
  }, []);

  // Vars
  const handleRefresh = async () => {
    setIsLoading(true);

    await retrievePromotions();

    setIsLoading(false);
  };

  const retrievePromotions = async () => {
    return httpService(`/api/Promotion/Promotion`, {
      data: {
        act: 'PromotionList',
        dt: JSON.stringify({ comp: '001' })
      },
    }).then(({ status, data }) => {
      setPromotion(state => ({
        ...state,
        models: 200 !== status ? [] : (data || []),
        modelsLoaded: true
      }));
    }).catch(() => {
      setPromotion(state => ({ ...state, modelsLoaded: true }));
    });
  };

  const renderPromotions = ({ item, index }: ListRenderItemInfo<PromotionModel>) => {
    const content = item.description || item.remark;

    return (
      <PressableBox
        key={index}
        style={styles.PromotionCard}
        onPress={() => navigation.navigatePath('Public', {
          screen: 'BottomTabs.NotificationStack.PromotionDetail',
          params: [null, null, {
            Promotion: item
          }]
        })}
      >
        {!item.PromotionImage ? null : (
          <Image source={{ uri: item.PromotionImage }} style={styles.PromotionCardImage} />
        )}
        <View style={{
            marginTop: 8,
            borderTopWidth: 1,
            borderColor: '#ccc'
          }} />
        <View style={{ flex: 1, marginTop: 10
         }}>
          <Typography numberOfLines={2}>
            {item.PromotionDescription || item.PromotionName}
          </Typography>

          {!content ? null : (
            <View style={{ marginTop: 4 }}>
              <RenderHtml
                contentWidth={width - 30 - (!item.PromotionImage ? 0 : 76)}
                source={{ html: content }}
              />
            </View>
          )}
        </View>
      </PressableBox>
    )
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        contentContainerStyle={styles.container}
        refreshControl={(
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            colors={[colors.palettes.primary]}
          />
        )}
        data={Promotion.models}
        renderItem={renderPromotions}
        ListEmptyComponent={!Promotion.modelsLoaded ? (
          <View style={[styles.PromotionCardContainer, { marginTop: 8 }]}>
            <View style={styles.PromotionCard}>
              <BoxLoading width={64} height={64} rounded={8} />

              <View style={{ flex: 1, paddingLeft: 12 }}>
                <BoxLoading width={[100, 150]} height={20} />

                <BoxLoading width={[140, 200]} height={18} style={{ marginTop: 6 }} />
                <BoxLoading width={[100, 130]} height={18} style={{ marginTop: 2 }} />
              </View>
            </View>
          </View>
        ) : (
          <View style={{ marginTop: 15 }}>
            <Typography textAlign="center">
              {t(`${''}Belum ada promosi.`)}
            </Typography>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 15,
    paddingBottom: 24,
    backgroundColor: colors.white,
    borderColor: '#F3F3F3',
  },

  actionBtnContainer: {
    ...shadows[3],
    backgroundColor: colors.white,
  },

  header: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: colors.white,
  },

  PromotionCardContainer: {
    marginHorizontal: 0,
    borderRadius: 12,
    backgroundColor: colors.white,
  },
  PromotionCard: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: '#FEFEFE',
    borderWidth: 1,
    borderColor: '#F3F3F3',
    ...shadows[3],
    marginTop: 10,
  },
  PromotionCardImage: {
    width: '100%',
    height: 120,
    borderRadius: 5,
    resizeMode: 'stretch',
    backgroundColor: '#F3F3F3',
    borderColor: '#F3F3F3',
  }
});

export default PromotionList;
