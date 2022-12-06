import { RouteProp, useRoute } from '@react-navigation/core';
import React, { useEffect, useState } from 'react';
import { Image, ListRenderItemInfo, RefreshControl, StyleSheet, useWindowDimensions, View, Alert, ScrollView } from 'react-native';
import { colors, shadows, wrapper } from '../../../lib/styles';
import { useAppNavigation } from '../../../router/RootNavigation';
import { Button, ImageAuto, PressableBox, RenderHtml, Typography } from '../../../ui-shared/components';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { FlatList } from 'react-native-gesture-handler';
import { Modelable, ReviewModel, ProductModel } from '../../../types/model';
import { BoxLoading } from '../../../ui-shared/loadings';
import { httpService } from '../../../lib/utilities';
import moment from 'moment';
import ReviewItem from '../../components/ReviewItem';
import { PublicAccountStackParamList } from '../../../router/publicBottomTabs';

function ReviewAll() {
  // Hooks
  const navigation = useAppNavigation();
  const route = useRoute<RouteProp<PublicAccountStackParamList, 'ReviewAll'>>();
  const { t } = useTranslation('reviewall');
  const { width } = useWindowDimensions();
  const [product, setProduct] = useState<Modelable<ProductModel>>({
    model: null,
    modelsLoaded: false,
  });

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [review, setReview] = useState<Modelable<ReviewModel>>({
    models: [],
    modelsLoaded: false,
  });

  useEffect(() => {
    product && setProduct(state => ({
      ...state,
      model: product,
      modelLoaded: false,
    }));
  }, [route.params]);

  // Effects
  useEffect(() => {
    handleRefresh();
  }, []);

  // Vars
  const handleRefresh = async () => {
    setIsLoading(true);

    await retrieveReviewsAll();

    setIsLoading(false);
  };

  const retrieveReviewsAll = async () => {
    return httpService('/api/review/review/', {
      data: {
        act: 'UlasanList',
        dt: JSON.stringify({ comp: '001', idprd: 'AAGB0017NR3FPF', limit: 'all' })
      }
    }).then(({ status, data }) => {
      if (200 === status) {
        setReview(state => ({
          ...state,
          models: data,
          modelsLoaded: true
        }));
      }
    }).catch(() => void(0));
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FEFEFE' }}>
      <View style={[wrapper.row]}>
        <PressableBox
            opacity
            onPress={() => navigation.navigatePath('Public', {
                screen: 'BottomTabs.HomeStack.ProductDetail',
                params: [null, null, {
                  product_id: route.params.product_id || 0,
                  product,
                }]
            })}>
            <Typography color="black" style={{ marginVertical: 15, marginHorizontal: 15 }}>
              <Ionicons name="arrow-back" size={18} /> {`${''}Semua Ulasan`}
            </Typography>
        </PressableBox>
      </View>
      <ScrollView
        style={{marginTop: 10}}
        refreshControl={(
          <RefreshControl
            refreshing={false}
            onRefresh={handleRefresh}
            colors={[colors.palettes.primary]}
          />
        )}
      >
        {!review.models?.length ? (
          <Typography style={{ textAlign: 'center' }}>
            {t('Ulasan masih kosong')}
          </Typography>
        ) : (
          <View>
            {review.models.map((item, index) => (
              <ReviewItem
                key={index}
                review={item}
                style={{
                  paddingHorizontal: 24,
                  marginHorizontal: -10,
                }}
              />
            ))}
          </View>
        )}
      </ScrollView>
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

  btnShare: {
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
  articleCard: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginVertical: 5,
    backgroundColor: '#FEFEFE',
    borderWidth: 2,
    borderColor: '#F3F3F3',
    borderRadius: 5,
  },
  articleCardImage: {
    width: '100%',
    height: 130,
    borderRadius: 5,
    resizeMode: 'stretch',
    backgroundColor: '#F3F3F3',
    borderColor: '#F3F3F3',
  }
});

export default ReviewAll;
