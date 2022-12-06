import React, { useEffect, useState } from 'react';
import { FlatListProps, Image, StyleSheet, useWindowDimensions, View } from 'react-native';
import { colors, shadows, wrapper } from '../../lib/styles';
import { Modelable, ProductModel, PromotionModel } from '../../types/model';
import { Badge, Button, PressableBox, Typography } from '../../ui-shared/components';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppNavigation } from '../../router/RootNavigation';
import { BadgeDiscount } from '../../ui-shared/components';
import { useAppSelector } from '../../redux/hooks';
import MasonryList from '@react-native-seoul/masonry-list';
import { toggleFavorite } from '../../redux/actions';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';

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
  const { user, favorites } = useAppSelector(({ user }) => user);
  const { width } = useWindowDimensions();
  const dispatch = useDispatch();
  const { t } = useTranslation('home');

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
        product,
      }]
    });
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
    const minHeight = (width - 30 - 12) / 2;
    const favorite = favorites.find((productItem) => item.prd_id === productItem.prd_id);
    const rating = item.rating || item.prd_star || item.star;
    const salesCount = parseInt(item.sales_count || item.sales || item.terjual || '0');

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

            {!discount ? null : (
              <BadgeDiscount
                containerStyle={styles.badgeDiscount}
                color="primary"
                label={t(`Diskon {{val}}%`, { val: discount }).toUpperCase()}
              />
            )}

            {!favoriteShow ? null : (
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
            )}
          </View>

          <View style={styles.productCardContent}>
            <Typography size="sm" type="h6" numberOfLines={2}>
              {item.prd_ds}
            </Typography>

            <Typography size="xs" style={{ marginTop: 4 }}>
              {`SKU : ${item.prd_no}`}
            </Typography>

            {!rating && !item.sales_count ? null : (
              <View style={[wrapper.row, { alignItems: 'center', marginTop: 8 }]}>
                {!rating ? null : (
                  <Badge
                    label={rating}
                    labelProps={{ size: 'sm' }}
                    left={(
                      <View style={{ marginRight: 4 }}>
                        <Ionicons name="star" size={20} color={colors.palettes.gold} />
                      </View>
                    )}
                  />
                )}

                {!rating || !salesCount ? null : (
                  <Typography size="sm" style={{ marginHorizontal: 4 }}>|</Typography>
                )}

                {!salesCount ? null : (
                  <Typography size="sm">{`${t(`Terjual`)} ${salesCount}`}</Typography>
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
    // marginHorizontal: -6,
  },

  colItem: {
    flexBasis: '50%',
  },

  productCardContainer: {
    marginHorizontal: 6,
    borderRadius: 20,
    marginBottom: 12,
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
    // height: 144,
    resizeMode: 'cover',
    backgroundColor: colors.gray[200]
  },
  productCardContent: {
    paddingTop: 12,
    paddingBottom: 15,
    paddingHorizontal: 12
  },

  badgeDiscount: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: '100%',
  }
});

export default Products;
