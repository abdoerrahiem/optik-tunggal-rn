import { useRoute } from '@react-navigation/core';
import React, { useEffect, useState } from 'react';
import { Image, ListRenderItemInfo, RefreshControl, StyleSheet, useWindowDimensions, View, Alert} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { colors, shadows, wrapper } from '../../../lib/styles';
import { useAppNavigation } from '../../../router/RootNavigation';
import { Typography, Button, ImageAuto, PressableBox, RenderHtml } from '../../../ui-shared/components';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { FlatList } from 'react-native-gesture-handler';
import { Modelable, BrandModel } from '../../../types/model';
import { BoxLoading } from '../../../ui-shared/loadings';
import { httpService } from '../../../lib/utilities';
import moment from 'moment';
import Brands from '../../components/Brands';
import BrandLoading from '../../loadings/BrandLoading';


function Brand() {
  const navigation = useAppNavigation();
  const route = useRoute();
  const { t } = useTranslation('brand');
  const { width } = useWindowDimensions();

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [brand, setBrand] = useState<Modelable<BrandModel>>({
    models: [],
    modelsLoaded: false,
  });

  // Effects
  useEffect(() => {
    handleRefresh();
  }, []);

  // Vars
  const handleRefresh = async () => {
    setIsLoading(true);

    await retrieveBrand();

    setIsLoading(false);
  };

  const retrieveBrand = async () => {
    return httpService(`/api/brand/brand`, {
      data: {
        act: 'BrandList',
      },
    }).then(({ status, data }) => {
      setBrand(state => ({
        ...state,
        models: 200 !== status ? [] : (data || []),
        modelsLoaded: true
      }));
    }).catch(() => {
      setBrand(state => ({ ...state, modelsLoaded: true }));
    });
  };

  const handleGoToBrandDetail = (Brand: BrandModel) => {
    if (!Brand.id) {
      return void(0);
    }

    navigation.navigatePath('Public', {
      screen: 'BottomTabs.BrandStack.BrandDetail',
      params: [null, null, {
        Brand_id: Brand.id || 0,
        Brand,
      }]
    });
  };

  const minHeight = (width - 90 - 12) / 4;

  return (
    <>
    {!brand.modelsLoaded ? (
        <View style={[styles.productCardImage, { minHeight, alignSelf: 'center' }]}>
          <BrandLoading />
        </View>
      ) : (
        <Brands
        contentContainerStyle={styles.container}
        onRefresh={handleRefresh}
        // loading={!product.modelsLoaded && !product.isPageEnd}
        data={brand.models} />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 1,
    paddingBottom: 24,
    backgroundColor: colors.white,
    borderColor: '#FEFEFE',
  },
  productCardImage: {
    width: '100%',
    backgroundColor: '#FEFEFE',
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
  brandCard: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginVertical: 5,
    backgroundColor: '#FEFEFE',
    borderWidth: 1,
    borderColor: '#FEFEFE',
    borderRadius: 5,
  },
  brandCardImage: {
    width: '100%',
    height: 130,
    borderRadius: 5,
    resizeMode: 'stretch',
    backgroundColor: '#FEFEFE',
    borderColor: '#FEFEFE',
  }
});
export default Brand;
