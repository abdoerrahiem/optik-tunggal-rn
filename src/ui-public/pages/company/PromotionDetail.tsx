import { RouteProp, useRoute } from '@react-navigation/core';
import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, useWindowDimensions, View, Image, ToastAndroid } from 'react-native';
import { colors, shadows } from '../../../lib/styles';
import { useAppNavigation } from '../../../router/RootNavigation';
import { ImageAuto, Typography } from '../../../ui-shared/components';
import { useTranslation } from 'react-i18next';
import { Modelable, ProductModel, PromotionModel, ModelablePaginate } from '../../../types/model';
import { PublicNotificationStackParamList } from '../../../router/publicBottomTabs';
import { BoxLoading } from '../../../ui-shared/loadings';
import { httpService } from '../../../lib/utilities';
import ProductsLoading from '../../loadings/ProductsLoading';
import Products from '../../components/Products';

function PromotionDetail() {
  // Hooks
  const navigation = useAppNavigation();
  const route = useRoute<RouteProp<PublicNotificationStackParamList, 'PromotionDetail'>>();
  const { t } = useTranslation('notification');
  const { width } = useWindowDimensions();

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [Promotion, setPromotion] = useState<Modelable<PromotionModel>>({
    model: null,
    modelLoaded: false,
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  const [product, setProduct] = useState<ModelablePaginate<ProductModel>>({
    models: [],
    modelsLoaded: false,
    page: 1,
    perPage: 12,
    isPageEnd: false,
  });

  // Effects
  useEffect(() => {
    if (route.params?.Promotion) {
      setPromotion(state => ({
        ...state,
        model: route.params.Promotion,
        modelLoaded: true
      }));
    }
    console.log('Promotion___'+route.params.Promotion);
  }, [route.params]);

  useEffect(() => {
    setProduct(state => ({
      ...state,
      page: 1
    }));
  }, []);

  useEffect(() => {
    if (!product.isPageEnd) {
      retrieveProducts(product.page);
    }
  }, [product.page]);

  // Vars
  const handleRefresh = async () => {
    setIsLoading(true);
    await retrievePromotion();
    await retrieveProducts();
    setIsLoading(false);
  };

  const retrieveProducts = async (page: number = 1) => {
    const reccnt = product.perPage * (page <= 1 ? 0 : page);
    setIsLoading(true);
    setProduct(state => ({ ...state, modelsLoaded: false }));

    return httpService('/api/product/product/', {
      data: {
        act: 'PrdPromotion',
        dt: JSON.stringify({
          reccnt,
          pg: page,
          limit: product.perPage,
          PromotionID: route.params.Promotion?.PromotionID || route.params.Promotion
        }),
      },
    }).then(({ status, data }) => {
      setIsLoading(false);
      if (200 === status) {
        setProduct(state => ({
          ...state,
          models: [...(state.models || []), ...data],
          modelsLoaded: true,
          isPageEnd: !data?.length,
        }));
      }
    }).catch(err => {
      setIsLoading(false);
      setProduct(state => ({ ...state, modelsLoaded: true }));
    });
  };

  const retrievePromotion = async () => {
    return new Promise(resolve => {
      setTimeout(() => {
        setPromotion(state => ({
          ...state,
          modelLoaded: true,
        }));

        resolve(null);
      }, 250);
    });
  };

  const { model: PromotionModel } = Promotion;

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
      {!Promotion.modelLoaded ? (
        <View>
          <BoxLoading width={width} height={width * 10/16} style={styles.image} />

          <BoxLoading width={[160, 200]} height={22} />
          <BoxLoading width={width - 30} height={18} style={{ marginTop: 12 }} />
          <BoxLoading width={width - 30} height={18} style={{ marginTop: 2 }} />
          <BoxLoading width={width - 30} height={18} style={{ marginTop: 2 }} />
          <BoxLoading width={[240, width - 30]} height={18} style={{ marginTop: 2 }} />
        </View>
      ) : (
        !PromotionModel? (
          <Typography textAlign="center" style={{ marginVertical: 12 }}>
            {t(`${''}Promotion not found.`)}
          </Typography>
        ) : (
          <View style={{paddingVertical: 15}}>
            {/* {!PromotionModel.PromotionImage ? null : (
              <View style={[styles.image, { maxHeight: width }]}>
                <ImageAuto
                  source={{ uri: PromotionModel.PromotionImage }}
                  width={width - 30}
                  style={{
                    marginHorizontal: 15,
                    marginTop: 16,
                    resizeMode: 'stretch'
                  }}
                />
              </View>
            )} */}

            {/* {!PromotionModel.PromotionImage ? null : ( */}
              <>
                <Typography size='sm' style={{ marginTop: 5, textAlign: 'justify' }}>
                  {PromotionModel?.description || PromotionModel?.PromotionDescription || route.params.description}.
                </Typography>
                <View style={{
                  marginTop: 8,
                  borderTopWidth: 1,
                  borderColor: '#ccc'
                }} />
                {/* <Typography type="h4" style={{ marginTop: 15}}>
                  Products
                </Typography> */}
              </>
            {/* )} */}
          </View>
        )
      )}
      <Products
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
        style={{ marginTop: 15, marginHorizontal: -5 }}
        loading={!product.modelsLoaded && !product.isPageEnd}
        onEndReached={() => {
          if (product.modelsLoaded) {
            setProduct(state => ({
              ...state,
              page: state.page + 1,
              modelsLoaded: false,
            }));
          }
        }}
        data={product.models}
        ListEmptyComponent={isLoading === true ? ( 
          <View style={{ marginHorizontal: 10 }}>
            <ProductsLoading />
            <Typography size="sm" textAlign="center" color={700} style={{ marginTop: 16 }}>
              {(`${t('Sedang memuat data...')}`)}
            </Typography>
          </View>
        ) : product.models?.length > 0 ? (
          <View style={{ marginHorizontal: 10 }}>
              <ProductsLoading />
              <Typography size="sm" textAlign="center" color={700} style={{ marginTop: 16 }}>
                {(`${t('Sedang memuat data...')}`)}
              </Typography>
            </View>
          ) : (
            <View style={[styles.container, styles.wrapper]}>
              <Image source={{ uri: 'https://www.callkirana.in/bootstrp/images/no-product.png' }} style={styles.sorry} />
              <Typography textAlign="center" style={{ marginVertical: 12 }}>
                {(`${t('Produk tidak ditemukan')}`)}
              </Typography>
            </View>
        )}
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
  wrapper: {
    backgroundColor: colors.white,
    paddingHorizontal: 25,
  },
  sorry: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginTop: 80
  },
  image: {
    marginHorizontal: -15,
    marginBottom: 16,
  }
});

export default PromotionDetail;
