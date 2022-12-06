import React, { useEffect, useState } from 'react';
import { FlatListProps, Image, StyleSheet, useWindowDimensions, View, ToastAndroid, Alert, Linking } from 'react-native';
import { colors, shadows, wrapper } from '../../lib/styles';
import { Modelable, ProductModel, PromotionModel } from '../../types/model';
import { Badge, Button, PressableBox, Typography } from '../../ui-shared/components';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppNavigation } from '../../router/RootNavigation';
import { BadgeDiscount, RatingStars } from '../../ui-shared/components';
import { useAppSelector } from '../../redux/hooks';
import MasonryList from '@react-native-seoul/masonry-list';
import { toggleFavorite } from '../../redux/actions';
import { useDispatch } from 'react-redux';
import { pushCartItem } from '../../redux/actions/shopActions'
import { default as _omit } from 'lodash/omit'
import {
  formatCurrency,
  getSupportedCurrencies,
} from "react-native-format-currency";

type MasonryListProps = React.ComponentProps<typeof MasonryList>;

type Props = Omit<MasonryListProps, 'data' | 'renderItem'> & {
  data?: ProductModel[];
  favoriteShow?: boolean;
};

function ProductsAdlens({
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
    console.log('CEK1 : ', product);
    navigation.navigatePath('Public', {
      screen: 'BottomTabs.HomeStack.ProductDetail_Adlens',
      params: [null, null, {
        product_id: product.prd_id || 0,
        product_ds: product.prd_ds || 0,
        product,
      }]
    });
  };

  let randomNumber = Math.floor(Math.random() * 100) + 1;

  const toCartAccessories = (product: ProductModel) => {
    // console.log()
    if(product.qty === 0){
      Alert.alert('',
        `Mohon maaf, stok terbatas. Hubungi customer service kami?`,
        [
          {
            text: `Tidak`,
          },
          {
            text: `Iya`,
            onPress: () => Linking.openURL('https://wa.me/6281113203000?text=Halo,%20Untuk%20produk%20ini%20'+product.prd_ds+'%20(%20'+product.prd_id+'%20)%20apakah%20%20tersedia?')  
          }
        ]
      )
    }else{
      dispatch(
        pushCartItem([
          {
            cartid: randomNumber,
            harga: product.harga,
            product: _omit(product || undefined, 'product_info'),
            atributColor3: '',
            atributSpheries3: '',
            atributBcurve3: '',
            qty: 1,
          },
        ])
      )
  
      navigation.navigatePath('Public', {
        screen: 'BottomTabs.CartStack.Cart',
      })
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
            {/* <Ionicons name="md-checkbox" size={20} color={'#0d674e'} style={{alignSelf: 'flex-end', padding: 5}} /> */}
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
                <Typography size='xs' color='white'>Stok terbatas</Typography>
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
    height: '100%'
  },
  productCardThumb: {
    height: '65%',
    overflow: 'hidden'
  },
  productCardImage: {
    width: '100%',
    height: '80%'
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

export default ProductsAdlens;
