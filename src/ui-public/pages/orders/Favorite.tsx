import { useRoute } from '@react-navigation/core';
import React, { useEffect, useState } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import { View } from 'react-native-animatable';
import { colors } from '../../../lib/styles';
import { useAppNavigation } from '../../../router/RootNavigation';
import { ModelablePaginate, ProductModel } from '../../../types/model';
import { Typography } from '../../../ui-shared/components';
import ProductsLoading from '../../loadings/ProductsLoading';
import Products from '../../components/Products';
import { httpService, Storage } from '../../../lib/utilities';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch } from 'react-redux';
import { setFavorites } from '../../../redux/actions';

function Favorite() {
  // Hooks
  const navigation = useAppNavigation();
  const route = useRoute();
  const { width, height } = useWindowDimensions();
  const { user, favorites } = useAppSelector(({ user }) => user);
  const dispatch = useAppDispatch();

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [product, setProduct] = useState<ModelablePaginate<ProductModel>>({
    models: [],
    modelsLoaded: false,
    page: 1,
    perPage: 12,
    isPageEnd: false,
  });
  const { t } = useTranslation('favorite');

  // Effects
  useEffect(() => {
    handleRefresh();
  }, []);

  useEffect(() => {
    setProduct(state => ({
      ...state,
      models: favorites,
    }));
  }, [favorites]);

  // Vars
  const handleRefresh = async () => {
    setIsLoading(true);

    await retrieveProducts();

    setIsLoading(false);
  };

  const retrieveProducts = async () => {
    setProduct(state => ({
      ...state,
      models: [],
      modelsLoaded: false
    }));

    return httpService('https://ws.stmorita.net/favorit/list', {
      data: {
        act: 'FavoritList',
        dt: JSON.stringify({ comp: '001', regid: user?.id })
      }
    }).then(({ status, data }) => {
      if (200 === status) {
        dispatch(setFavorites(data || [])).then(() => {
          setProduct(state => ({ ...state, modelsLoaded: true }));
        });
      }
    }).catch(() => void(0))
  };

  return (
    <Products
      contentContainerStyle={[styles.container, styles.wrapper]}
      refreshing={isLoading}
      onRefresh={handleRefresh}
      loading={!product.modelsLoaded && !product.isPageEnd}
      onEndReached={() => {
        if (product.modelsLoaded && false) {
          setProduct(state => ({
            ...state,
            page: state.page + 1,
            modelsLoaded: false,
          }));
        }
      }}
      data={product.models}
      favoriteShow
      ListHeaderComponent={(
        <View style={[styles.wrapper, { paddingTop: 8, paddingBottom: 12 }]}>
          <Typography type="h5" style={{ marginVertical: 12 }}>
            {`${''}Produk Favorit`}
          </Typography>
        </View>
      )}
      LoadingView={(
        <ProductsLoading />
      )}
      ListEmptyComponent={!product.modelsLoaded ? (
        <ProductsLoading />
      ) : product.models?.length ? null : (
        <View style={{ flex: 1, marginVertical: 24, alignItems: 'center' }}>
          <Ionicons
            name={'heart-outline'}
            size={40}
            color={colors.gray[600]}
            style={{ marginTop: 2 }}
          />

          <Typography textAlign="center" style={{ marginTop: 12 }}>
            {t(`${''}Belum ada produk favorit`)}
          </Typography>
        </View>
      )}
      ListFooterComponent={!product.isPageEnd ? null : (
        <Typography size="sm" textAlign="center" color={700} style={{ marginTop: 16 }}>
          {t(`${''}Sudah menampilkan semua produk`)}
        </Typography>
      )}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  wrapper: {
    backgroundColor: colors.white,
    paddingHorizontal: 15,
  },
});

export default Favorite;
