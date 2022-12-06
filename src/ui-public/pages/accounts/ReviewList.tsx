import { useRoute } from '@react-navigation/core';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, RefreshControl, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { colors, shadows, wrapper } from '../../../lib/styles';
import { useAppNavigation } from '../../../router/RootNavigation';
import { PressableBox, RatingStars, Typography } from '../../../ui-shared/components';
import { Modelable, ReviewModel } from '../../../types/model';
import ViewCollapse from '../../components/ViewCollapse';
import { BoxLoading } from '../../../ui-shared/loadings';
import moment from 'moment';
import ReviewEditModal from '../../components/ReviewEditModal';
import { httpService } from '../../../lib/utilities';
import { useAppSelector } from '../../../redux/hooks';

type OptionsState = {
  reviewModalOpen?: boolean;
  reviewModel?: ReviewModel | null;
};

function ReviewList() {
  // Hooks
  const navigation = useAppNavigation();
  const route = useRoute();
  const { width, height } = useWindowDimensions();
  const { t } = useTranslation('account');
  const { user } = useAppSelector(({ user }) => user);

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [review, setReview] = useState<Modelable<ReviewModel>>({
    models: [],
    modelsLoaded: false,
  });
  const [options, setOptions] = useState<OptionsState>({
    reviewModalOpen: false,
    reviewModel: null,
  });

  // Effects
  useEffect(() => {
    handleRefresh();
  }, []);

  // Vars
  const handleRefresh = async () => {
    setIsLoading(true);

    await retrieveReviews();

    setIsLoading(false);
  };

  const retrieveReviews = async () => {
    setReview(state => ({
      ...state,
      models: [],
      modelsLoaded: false
    }));

    return httpService('/api/product/product', {
      data: {
        act: 'MPPrdList',
        dt: JSON.stringify({
          comp: '001',
          regid: user?.id
        }),
      },
    }).then(({ status, data }) => {
      setIsLoading(false);

      if (200 === status) {
        setReview(state => ({
          ...state,
          models: data.map((item: any): ReviewModel => {
            return {
              product: {
                prd_id: item.prdid,
                prd_no: item.prdid,
                prd_ds: item.prdid,
                prd_foto: item.foto || item.prdfoto || item.prd_foto,
              },
              star: 0,
            };
          }),
          modelsLoaded: true,
        }));
      }
    }).catch(err => {
      setIsLoading(false);

      setReview(state => ({ ...state, modelsLoaded: true }));
    });
  };

  const handleModalToggle = (type: string, open: null | boolean = null, args: OptionsState = {}) => {
    let toggle: boolean;

    switch (type) {
      case 'review':
        toggle = 'boolean' === typeof open ? open : !options.reviewModalOpen;

        if (!toggle) {
          // args.reviewModel = null;
        }

        setOptions(state => ({
          ...state,
          reviewModalOpen: toggle,
          ...args,
        }));
        break;
    }
  };

  const renderReviewLoading = () => {
    return (
      <View style={{ marginVertical: 12, marginHorizontal: 15 }}>
        <View style={styles.reviewBoxContainer}>
          <View style={styles.reviewBox}>
            <BoxLoading width={72} height={72} />

            <View style={{ flex: 1, paddingLeft: 12 }}>
              <BoxLoading width={[80, 100]} height={18} />

              <BoxLoading width={[160, 200]} height={20} style={{ marginTop: 4 }} />

              <BoxLoading width={120} height={20} style={{ marginTop: 4 }} />
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderReviews = (item: ReviewModel, index: number) => {
    const image = !item.product?.images?.length ? item.product?.prd_foto : item.product.images[0].prd_foto;

    return (
      <PressableBox
        key={index}
        containerStyle={[styles.reviewBoxContainer, {
          marginTop: index === 0 ? 0 : 15,
        }]}
        style={styles.reviewBox}
        onPress={() => handleModalToggle('review', true, {
          reviewModel: item
        })}
      >
        {!image ? null : (
          <Image source={{ uri: image }} style={styles.reviewImage} />
        )}

        <View style={{ flex: 1 }}>
          {!item.date ? null : (
            <Typography size="sm" style={{ marginBottom: 4 }}>
              {moment(item.date).format('D MMM YYYY')}
            </Typography>
          )}

          <Typography>
            {item.product?.prd_ds}
          </Typography>

          <RatingStars
            style={{ alignSelf: 'flex-start', marginTop: 4 }}
            value={item.star}
            size={20}
            editable={false}
          />
        </View>
      </PressableBox>
    );
  };

  const unreviews = review.models?.filter((item) => !item.star) || [];
  const reviews = review.models?.filter((item) => !!item.star) || [];

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={(
        <RefreshControl
          refreshing={isLoading}
          onRefresh={handleRefresh}
          colors={[colors.palettes.primary]}
        />
      )}
    >
      <View style={{ marginTop: 15 }}>
        <ViewCollapse
          style={styles.menuContainer}
          pressableProps={{
            containerStyle: styles.menuBtnContainer,
          }}
          header={t(`${''}Menunggu Diulas`)}
        >
          {!review.modelsLoaded ? (
            renderReviewLoading()
          ) : (
            !unreviews.length ? (
              <Typography textAlign="center" style={{ paddingVertical: 12 }}>
                {t(`${''}Belum ada produk yang dapat diulas.`)}
              </Typography>
            ) : (
              <View style={{ paddingHorizontal: 15, paddingVertical: 12 }}>
                {unreviews.map((item, index) => renderReviews(item, index))}
              </View>
            )
          )}
        </ViewCollapse>
      </View>

      <View style={{ marginTop: 0 }}>
        <ViewCollapse
          style={styles.menuContainer}
          pressableProps={{
            containerStyle: styles.menuBtnContainer,
          }}
          header={t(`${''}Riwayat`)}
        >
          {!review.modelsLoaded ? (
            renderReviewLoading()
          ) : (
            !reviews.length ? (
              <Typography textAlign="center" style={{ paddingVertical: 12 }}>
                {t(`${''}Belum ada riwayat ulasan.`)}
              </Typography>
            ) : (
              <View style={{ paddingHorizontal: 15, paddingVertical: 12 }}>
                {reviews.map((item, index) => renderReviews(item, index))}
              </View>
            )
          )}
        </ViewCollapse>
      </View>

      {/* Review Modal */}
      <ReviewEditModal
        isVisible={options.reviewModalOpen}
        onSwipeComplete={() => handleModalToggle('review', false)}
        onBackButtonPress={() => handleModalToggle('review', false)}
        onBackdropPress={() => handleModalToggle('review', false)}
        onSuccess={(model) => {
          setReview(state => ({
            ...state,
            models: state.models?.map((item) => {
              if (item.product?.prd_id === options.reviewModel?.product?.prd_id) {
                return { ...item, ...model };
              }

              return item;
            }),
          }));

          handleModalToggle('review', false, {
            reviewModel: null
          });
        }}
        title={t(`${''}Ulas Produk`)}
        review={options.reviewModel || undefined}
        product={options.reviewModel?.product}
        editable={!options.reviewModel?.star}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 15,
    paddingBottom: 24,
    backgroundColor: colors.white,
  },

  actionBtnContainer: {
    ...shadows[3],
    backgroundColor: colors.white,
  },

  menuContainer: {
    margin: -15,
    paddingVertical: 15,
  },
  menuBtnContainer: {
    marginHorizontal: 15,
    borderRadius: 0,
    borderBottomWidth: 1,
    borderColor: colors.transparent('palettes.primary', 0.5)
  },

  reviewBoxContainer: {
    backgroundColor: colors.white,
    marginHorizontal: 0,
  },
  reviewBox: {
    ...wrapper.row,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  reviewImage: {
    width: 72,
    height: 72,
    borderRadius: 12,
    marginRight: 12,
  }
});

export default ReviewList;
