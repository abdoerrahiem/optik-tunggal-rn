import React, { useEffect, useState } from 'react';
import { FlatListProps, Image, StyleSheet, useWindowDimensions, View } from 'react-native';
import { colors, shadows, wrapper } from '../../lib/styles';
import { Modelable, BrandModel } from '../../types/model';
import { Badge, Button, PressableBox, Typography } from '../../ui-shared/components';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppNavigation } from '../../router/RootNavigation';
import { BadgeDiscount } from '../../ui-shared/components';
import { useAppSelector } from '../../redux/hooks';
import MasonryList from '@react-native-seoul/masonry-list';
import { toggleFavorite } from '../../redux/actions';
import { useDispatch } from 'react-redux';

type MasonryListProps = React.ComponentProps<typeof MasonryList>;

type Props = Omit<MasonryListProps, 'data' | 'renderItem'> & {
  data?: BrandModel[];
  favoriteShow?: boolean;
};

function Brands({
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
  const [brand, setBrand] = useState<Modelable<BrandModel>>({
    models: [],
    modelsLoaded: false,
  });

  // Effects
  useEffect(() => {
    setBrand(state => ({
      ...state,
      models: [...data],
      modelsLoaded: true
    }));
  }, [data]);

  const handleGoToDetail = (brand: BrandModel) => {
    if (!brand.id) {
      return void(0);
    }

    navigation.navigatePath('Public', {
      screen: 'BrandProduct',
      params: [{
        // product_id: brand.id || 0,
        keywords : 'searchbybrand',
        merk: brand.id,
        brand,
      }]
    });
  };

  const renderBrand = (item: BrandModel, index: number) => {
    const minHeight = (width - 30 - 12) / 4;

    return (
      <PressableBox
        containerStyle={styles.productCardContainer}
        style={styles.productCard}
        onPress={() => handleGoToDetail(item)}
      >
        <View>
          {!item.fotobrand ? (
            <View style={[styles.productCardImage, { minHeight }]} />
          ) : (
              <Image source={{ uri: item.fotobrand }} style={[styles.productCardImage, { minHeight }]} />
          )}
        </View>
      </PressableBox>
    );
  };

  return (
    <MasonryList
      data={(brand.models || []) as BrandModel[]}
      renderItem={({ item, i }) => renderBrand(item, i)}
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
    marginHorizontal: 5,
    marginVertical: 5,
    borderRadius: 5,
    marginBottom: 5,
    backgroundColor: '#FEFEFE',
    ...shadows[3],
  },
  productCard: {
    flexDirection: 'column',
    paddingHorizontal: 40,
    backgroundColor: '#FEFEFE',
  },
  productCardImage: {
    width: '100%',
    // height: 144,
    resizeMode: 'contain',
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

export default Brands;
