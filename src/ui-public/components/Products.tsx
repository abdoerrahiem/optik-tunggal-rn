import React, { useEffect, useState } from 'react';
import { FlatListProps, Image, StyleSheet, useWindowDimensions, View } from 'react-native';
import { colors, shadows, wrapper } from '../../lib/styles';
import { Modelable, ProductModel, PromotionModel } from '../../types/model';
import { Badge, Button, BadgeDiscount, PressableBox, Typography } from '../../ui-shared/components';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppNavigation } from '../../router/RootNavigation';
import { useAppSelector } from '../../redux/hooks';
import MasonryList from '@react-native-seoul/masonry-list';
import { toggleFavorite } from '../../redux/actions';
import { useDispatch } from 'react-redux';
import {
  formatCurrency,
  getSupportedCurrencies,
} from "react-native-format-currency";

type MasonryListProps = React.ComponentProps<typeof MasonryList>;

type Props = Omit<MasonryListProps, 'data' | 'renderItem'> & {
  data?: ProductModel[];
  favoriteShow?: boolean;
};

function Products({
  data = [],
  favoriteShow = false,
  style,
  ...props
}: Props) {
  // Hooks
  const navigation = useAppNavigation();
  // const { user, favorites } = useAppSelector(({ user }) => user);
  const { user: { user, favorites } } = useAppSelector((state) => state);
  const { width } = useWindowDimensions();
  const dispatch = useDispatch();

  // States
  const [product, setProduct] = useState<Modelable<ProductModel>>({
    models: [],
    modelsLoaded: false,
  });

  // Effects
  useEffect(() => {
    setProduct(state => ({
      ...state,
      models: [...data],
      modelsLoaded: true
    }));
  }, [data]);

  useEffect(() => {
    if (product.modelLoaded) {
      // retrieveReviews();
    }
  }, [product.modelLoaded]);

  useEffect(() => {
    // 
  }, [favorites]);

  // Vars
  const handleGoToDetail = (product: ProductModel) => {
    if(product.jeniswarna === 'clear'){
      clearDetail(product);
    }else{
      navigation.navigatePath('Public', {
        screen: 'ProductDetail',
        params: [{
          product_id: product.prd_id || 0,
          product_ds: product.prd_ds || 0,
          product,
          brand: product.brands
        }]
      });
    }

    if(product.merk === 'ADLENS'){
      detailProduct(product)
    }    
  };

  const clearDetail = (product: any) => {
    navigation.navigatePath('Public', {
      screen: 'BottomTabs.HomeStack.ProductDetailClear',
      params: [null, null, {
        product_id: product.prd_id || 0,
        product_ds: product.prd_ds || 0,
        product,
        brand: product.brands
      }]
    });
  }

  const detailProduct = (product: any) =>{
    if(product.merk === 'ADLENS'){
      navigation.navigatePath('Public', {
        screen: 'BottomTabs.HomeStack.ProductDetailAdlens',
        params: [null, null, {
          product_id: product.prd_id || 0,
          product_ds: product.prd_ds || 0,
          product,
          brand: product.brands
        }]
      });
    }else{
      navigation.navigatePath('Public', {
        screen: 'ProductDetail',
        params: [{
          product_id: product.prd_id || 0,
          product_ds: product.prd_ds || 0,
          product,
          brand: product.brands
        }]
      });
      // navigation.navigatePath('Public', {
      //   screen: 'BottomTabs.HomeStack.ProductDetail',
      //   params: [null, null, {
      //     product_id: product.prd_id || 0,
      //     product_ds: product.prd_ds || 0,
      //     product,
      //     brand: product.brands
      //   }]
      // });
    }
  }

  const { ...productModel } = product.model || {};
  const favorite = favorites.find((item) => item.prd_id === product.model?.prd_id);

  const handleFavoriteToggle = async () => {
    if (!user) {
      return navigation.navigatePath('Public', {
        screen: 'BottomTabs.AccountStack.Account',
      });
    }
    // console.log("DATA_PRODUK: "+product.model?.id);
    return !product.model ? void(0) : dispatch(toggleFavorite(product.model));
  };

  const renderProducts = (item: ProductModel, index: number) => {
    const discount = parseFloat(item.diskon || '0');
    const minHeight = (width - 30 - 12) / 2.5;
    const favorite = favorites.find((productItem) => item.prd_id === productItem.prd_id);

    return (
      <View key={index} style={styles.colItem}>
        <PressableBox
          containerStyle={styles.productCardContainer}
          style={styles.productCard}
          onPress={() => handleGoToDetail(item)}
        >
          <View style={styles.productCardThumb}>
            {!item.prd_foto ? (
              <View style={[styles.productCardImage, { minHeight }]} />
            ) : (
              <Image source={{ uri: item.prd_foto }} style={[styles.productCardImage, { minHeight, resizeMode: 'contain', marginBottom: 10 }]} />

            )}
            {item.qty == 0 ? (
              <BadgeDiscount
                containerStyle={{
                  position: 'absolute',
                  bottom: 5,
                  left: 5,
                  backgroundColor: 'red',
                }}
              >
                <Typography size='xxs' color='white'>Stok terbatas</Typography>
              </BadgeDiscount>
            ) : null}
          </View>

          <View style={styles.productCardContent}>
            <View style={{ height: 1, backgroundColor: '#f1f1f1' }} />
            <Typography 
              style={{ fontSize: 10, paddingHorizontal: 10, marginTop: 10, 
                       fontWeight: 'bold', textAlign: 'center', color: '#333', height: 40}}>
              {`${item.prd_ds}`.toUpperCase()}
            </Typography>
            {/* {item.prd_ds?.length != 56 ? 
              (
                <>
                  <Typography style={{ fontSize: 11, fontWeight: 'bold', textAlign: 'center', color: '#333'}} numberOfLines={2} ellipsizeMode='tail'>
                    {`${item.prd_ds}`.toUpperCase()}
                  </Typography>
                </>
              )
              :
              (
                <Typography style={{ fontSize: 11, fontWeight: 'bold', textAlign: 'center', color: '#333'}} numberOfLines={2} ellipsizeMode='tail'>
                  {`${item.prd_ds}`.toUpperCase()}
                </Typography>
            )}  */}
            {/* <Typography style={{ fontSize: 11, textAlign: 'center' }}>
              {item.prd_no}
            </Typography> */}
            {/* <Typography style={{ fontSize: 12, textAlign: 'center' }}>
              {item.prd_ds}
            </Typography> */}
            
            <Typography size="sm" style={{ color: '#0d674e', textAlign: 'center', marginBottom: 30, marginTop: 5 }}>
              {formatCurrency({ amount: Number(item.harga), code: 'IDR' })} 
            </Typography>

            {!item.rating && !item.sales_count ? null : (
              <View style={[wrapper.row, { alignItems: 'center', marginTop: 8 }]}>
                {!item.rating ? null : (
                  <Badge
                    label={item.rating}
                    labelProps={{ size: 'sm' }}
                    left={(
                      <View style={{ marginRight: 4 }}>
                        <Ionicons name="star" size={20} color={colors.palettes.gold} />
                      </View>
                    )}
                  />
                )}

                {!item.rating || !item.sales_count ? null : (
                  <Typography size="sm" style={{ marginHorizontal: 4 }}>|</Typography>
                )}

                {!item.sales_count ? null : (
                  <Typography size="sm">{item.sales_count}</Typography>
                )}
              </View>
            )}
          </View>
        </PressableBox>
      </View>
    );
  };

  return (
    <MasonryList
      data={(product.models || []) as ProductModel[]}
      renderItem={({ item, i }) => renderProducts(item, i)}
      style={[styles.container, style]}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: -13,
  },

  colItem: {
    flexBasis: '50%',
  },

  productCardContainer: {
    marginHorizontal: 3,
    borderRadius: 3,
    marginBottom: 5,
    backgroundColor: colors.white,
    ...shadows[3],
  },
  productCard: {
    flexDirection: 'column',
    paddingHorizontal: 0,
    paddingVertical: 10,
    height: '100%'
  },
  productCardThumb: {
    height: '65%',
    overflow: 'hidden'
  },
  productCardImage: {
    width: '100%',
    height: '80%',
  },
  productCardContent: {
    width: 'auto'
  },
  user: {
    ...wrapper.row,
    alignItems: 'center',
  },
  badgeDiscount: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: '100%',
  }
});

export default Products;
