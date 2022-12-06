import { RouteProp, useRoute } from '@react-navigation/core';
import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, useWindowDimensions, View, Image } from 'react-native';
import { colors, shadows, wrapper } from '../../../../lib/styles';
import { useAppNavigation } from '../../../../router/RootNavigation';
import { ImageAuto, Typography, RenderHtml, PressableBox } from '../../../../ui-shared/components';
import { useTranslation } from 'react-i18next';
import { Modelable, BannerModel, ModelablePaginate } from '../../../../types/model';
import { PublicArticleStackParamList } from '../../../../router/publicBottomTabs';
import { BoxLoading } from '../../../../ui-shared/loadings';
import { httpService } from '../../../../lib/utilities';
import ProductsLoading from '../../../loadings/ProductsLoading';
import Products from '../../../components/Products';
import Ionicons from 'react-native-vector-icons/Ionicons';

function BannerDetail() {
  // Hooks
  const navigation = useAppNavigation();
  const route = useRoute<RouteProp<PublicArticleStackParamList, 'BannerDetail'>>();
  const { t } = useTranslation('banner');
  const { width } = useWindowDimensions();

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [banner, setBanner] = useState<Modelable<BannerModel>>({
    model: null,
    modelLoaded: false,
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {

  });

  useEffect(() => {
    if (route.params?.banner) {
      setBanner(state => ({
        ...state,
        model: route.params.banner,
        modelLoaded: true
      }));
    }
  }, [route.params]);


  // Vars
  const handleRefresh = async () => {
    setIsLoading(true);

    await retrieveBannerDetail();

    setIsLoading(false);
  };

  const retrieveBannerDetail = async () => {
    return new Promise(resolve => {
      setTimeout(() => {
        setBanner  (state => ({
          ...state,
          modelLoaded: true,
        }));

        resolve(null);
      }, 250);
    });
  };

  const { model: bannerModel } = banner;
  
  return (
    <View style={{ height: '100%', backgroundColor: '#FEFEFE' }}>
      <View style={[wrapper.row]}>
        <PressableBox
            opacity
            style={{ alignItems: 'center', }}
            onPress={() => navigation.navigatePath('Public', {
                screen: 'BottomTabs.HomeStack'
            })}>
            <Typography color="black" style={{ marginVertical: 20, marginHorizontal: 15 }}>
              <Ionicons name="arrow-back" size={18} color={colors.gray[900]} /> {`${''}Back`}
            </Typography>
        </PressableBox>
      </View>
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
        {!banner.modelLoaded ? (
          <View>
            <BoxLoading width={width} height={width * 10/16} style={styles.image} />

            <BoxLoading width={[160, 200]} height={22} />
            <BoxLoading width={width - 30} height={18} style={{ marginTop: 12 }} />
            <BoxLoading width={width - 30} height={18} style={{ marginTop: 2 }} />
            <BoxLoading width={width - 30} height={18} style={{ marginTop: 2 }} />
            <BoxLoading width={[240, width - 30]} height={18} style={{ marginTop: 2 }} />
          </View>
        ) : (
          !bannerModel? (
            <View>
              <Typography style={{ textAlign: 'center', marginTop: 250, }}>
                Tidak ditemukan
              </Typography>
              <ImageAuto
                source={{ uri: 'https://img.freepik.com/free-vector/flat-engineering-construction-illustrated_23-2148892788.jpg?size=626&ext=jpg' }}
                width={width - 200}
                style={{
                  marginHorizontal: 15,
                  marginTop: 16,
                  alignSelf: 'center',
                  resizeMode: 'stretch'
                }}
              />
            </View>
          ) : (
            <View>
              <ImageAuto
                source={{ uri: bannerModel.banner_foto }}
                width={width}
                style={{
                  resizeMode: 'stretch'
                }}

              />
              <Typography style={{paddingHorizontal: 10, marginTop: 10, textAlign: 'justify', lineHeight: 25, fontWeight: 'bold'}}>{bannerModel.banner_title}</Typography>
              <Typography style={{paddingHorizontal: 10, marginTop: 10, textAlign: 'justify', lineHeight: 25}}>{bannerModel.banner_desc}</Typography>
            </View>
          )
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingBottom: 24,
    backgroundColor: colors.white,
  },

  image: {
    marginHorizontal: -15,
    marginBottom: 16,
  }
});

export default BannerDetail;
