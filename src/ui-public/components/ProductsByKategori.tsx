import React, { useEffect, useState } from 'react';
import { FlatListProps, Image, StyleSheet, useWindowDimensions, View } from 'react-native';
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
import {
  formatCurrency,
  getSupportedCurrencies,
} from "react-native-format-currency";

type MasonryListProps = React.ComponentProps<typeof MasonryList>;

type Props = Omit<MasonryListProps, 'data' | 'renderItem'> & {
  data?: ProductModel[];
  favoriteShow?: boolean;
};

function ProductsByKategori({
  data = [],
  favoriteShow = false,
  style,
  ...props
}: Props) {
  // Hooks
  const navigation = useAppNavigation();
  const { user, favorites } = useAppSelector(({ user }) => user);
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

  // Vars
  const handleGoToDetail = (product: ProductModel) => {
    if (!product.prd_id) {
      return void(0);
    }

    navigation.navigatePath('Public', {
      screen: 'BottomTabs.HomeStack.ProductDetail',
      params: [null, null, {
        product_id: product.prd_id || 0,
        product_ds: product.prd_ds || 0,
        product,
        brand: product.brands
      }]
    });
    console.log(product);
  };

  const handleFavoriteToggle = async (item: ProductModel, index: number) => {
    if (!user) {
      return navigation.navigatePath('Public', {
        screen: 'BottomTabs.AccountStack.Account',
      });
    }

    return dispatch(toggleFavorite(item));
  };

  const renderProducts = (item: ProductModel, index: number) => {
    const discount = parseFloat(item.diskon || '0');
    const minHeight = (width - 30 - 12) / 3;
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
              <Image source={{ uri: item.prd_foto }} style={[styles.productCardImage, { minHeight }]} />

            )}

            {/*!discount ? null : (
              <Typography style={{backgroundColor: 'red', color: '#FEFEFE', padding: 3, textAlign: 'center', borderRadius: 3, marginTop: 10}}>
                {(`${''}Disc ${discount}%`).toUpperCase()}
              </Typography>
            )*/}

            {/*!favoriteShow ? null : (
              <Button
                containerStyle={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  backgroundColor: colors.white,
                  elevation: 2,
                }}
                size={32}
                rounded={32}
                onPress={() => handleFavoriteToggle(item, index)}
              >
                <Ionicons
                  name={!favorite ? 'heart-outline' : 'heart'}
                  size={24}
                  color={!favorite ? colors.gray[600] : colors.palettes.red}
                  style={{ marginTop: 2 }}
                />
              </Button>
            )*/}
          </View>

          <View style={styles.productCardContent}>
            <View style={{ height: 1, backgroundColor: '#f1f1f1', marginBottom: 10 }} />
            <Typography style={{ fontSize: 12, fontWeight: 'bold', textAlign: 'center'}}>
              {item.merk}
            </Typography>
            <Typography style={{ fontSize: 12, textAlign: 'center' }}>
              {item.prd_no}
            </Typography>
            <Typography style={{ fontSize: 12, textAlign: 'center' }}>
              {item.prd_ds}
            </Typography>

            {/*<View style={styles.user}>
              <RatingStars
                size={14}
                value={5}
                icons={['star', 'star-outline']}
              />
              <Typography style={{ fontSize: 10, fontWeight: 'bold', marginTop: 5, marginLeft: 5 }}>
                (4.9)
              </Typography>
            </View>*/}

            <Typography size="md" style={{ marginTop: 10, color: '#0d674e', textAlign: 'center' }}>
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
  },
  productCardThumb: {
    position: 'relative',
  },
  productCardImage: {
    width: '100%',
    marginTop: 15,
  },
  productCardContent: {
    paddingTop: 12,
    paddingBottom: 15,
    paddingHorizontal: 10
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

export default ProductsByKategori;
