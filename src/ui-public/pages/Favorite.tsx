import { useRoute } from '@react-navigation/core';
import React, { useEffect, useState } from 'react';
import { StyleSheet, useWindowDimensions, ToastAndroid } from 'react-native';
import { View } from 'react-native-animatable';
import { colors } from '../../lib/styles';
import { useAppNavigation } from '../../router/RootNavigation';
import { ModelablePaginate, ProductModel } from '../../types/model';
import { Typography, Header, PressableBox } from '../../ui-shared/components';
import ProductsLoading from '../loadings/ProductsLoading';
import Products from '../components/Products';
import { httpService, Storage } from '../../lib/utilities';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { setFavorites } from '../../redux/actions';
import AccountBanner from '../components/AccountBanner';

function Favorite() {
  // Hooks
  const navigation = useAppNavigation();
  const route = useRoute();
  const { width, height } = useWindowDimensions();
  const { user, favorites } = useAppSelector(({ user }) => user);
  const dispatch = useAppDispatch();
  const { t } = useTranslation('favorite');

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [product, setProduct] = useState<ModelablePaginate<ProductModel>>({
    models: [],
    modelsLoaded: false,
    page: 1,
    perPage: 12,
    isPageEnd: false,
  });

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
    retrieveProducts();
    setIsLoading(false);
  };

  if(user?.id == undefined){
    const idcust = '0';
  }else{
    const idcust = user?.id;
  }

  const retrieveProducts = async () => {
    setProduct(state => ({
      ...state,
      models: [],
      modelsLoaded: false
    }));

    return httpService('/api/product/product', {
      data: {
        act: 'PrdFavorite',
        dt: JSON.stringify({ regid: user?.id === undefined ? '0' : (user?.id) }),
      },
    }).then(({ status, data }) => {
      if (200 === status) {
        dispatch(setFavorites(data || [])).then(() => {
          setProduct(state => ({ ...state, modelsLoaded: true }));
        });
      }
    }).catch(() => void(0))
  };

  const renderUnauthenticated = () => {
    return (
      <View style={{ flex: 1, position: 'relative', marginVertical: -15 }}>

        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.wrappersss}>
            <AccountBanner />
          </View>
        </SafeAreaView>
      </View>
    );
  };

  return (
    <>
      {!user ? renderUnauthenticated() : (
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
            <View style={[styles.wrapper, { paddingTop: 8, paddingBottom: 12, paddingHorizontal: -10 }]}>
              <Typography type="h5" style={{ marginVertical: 5 }}>
                {`${''}Product Wishlist`}
              </Typography>
              <Typography>
              Semua wishlist
              </Typography>
            </View>
          )}
          ListEmptyComponent={!product.modelsLoaded ? (
            <View style={{ flex: 1, marginVertical: 150, alignItems: 'center' }}>
              {/*<Ionicons
                name={'heart-outline'}
                size={40}
                color={colors.gray[600]}
                style={{ marginTop: 2 }}
              />*/}

              <Typography textAlign="center" style={{ marginTop: 10 }}>
                {t(`${''}Produk keinginanmu belum ada.`)}
              </Typography>
              <PressableBox
                containerStyle={{
                  position: 'absolute',
                  marginTop: 50,
                  width: 250,
                  backgroundColor: '#dbdbdb',
                }}
                onPress={() => navigation.navigatePath('Public', {
                  // screen: 'BottomTabs.OtherStack.Katalog'
                  screen: 'BottomTabs.HomeStack.Search',
                })}
              >
                <Typography textAlign="center" style={{ paddingVertical: 10}}>
                  {t(`${''}View Products`)}
                </Typography>
              </PressableBox>
            </View>
          ) : product.models?.length ? null : (
            <View style={{ marginHorizontal: 10 }}>
              <ProductsLoading />
            </View>
          )}
          ListFooterComponent={!product.isPageEnd ? null : (
            <Typography size="sm" textAlign="center" color={700} style={{ marginTop: 16 }}>
              {t(`${''}Already showing all products`)}
            </Typography>
          )}
        />
      )}
    </>  
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingBottom: 24,
    marginHorizontal: 10
  },
  wrappersss: {
    flexGrow: 1,
  },
  wrapper: {
    backgroundColor: colors.white,
    paddingHorizontal: 15,
  },
});

export default Favorite;
