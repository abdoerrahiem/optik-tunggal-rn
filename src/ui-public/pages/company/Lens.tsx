import { useRoute } from '@react-navigation/core';
import React, { useEffect, useState } from 'react';
import { Image, ListRenderItemInfo, RefreshControl, StyleSheet, useWindowDimensions, View, Alert, ScrollView } from 'react-native';
import { colors, shadows, wrapper } from '../../../lib/styles';
import { useAppNavigation } from '../../../router/RootNavigation';
import { Button, ImageAuto, PressableBox, RenderHtml, Typography } from '../../../ui-shared/components';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { FlatList } from 'react-native-gesture-handler';
import { Modelable, ArticleModel } from '../../../types/model';
import { BoxLoading } from '../../../ui-shared/loadings';
import { httpService } from '../../../lib/utilities';
import moment from 'moment';

function Lens() {
  // Hooks
  const navigation = useAppNavigation();
  const route = useRoute();
  const { t } = useTranslation('notification');
  const { width } = useWindowDimensions();

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [article, setArticle] = useState<Modelable<ArticleModel>>({
    models: [],
    modelsLoaded: false,
  });

  const [tabActive, setTabActive] = useState<number>(1);
  const handleTabToggle = (tab: number) => {
    setTabActive(tab === tabActive ? 1 : tab);
    if(tab === 1){
      retrieveZeiss();
    }

    if(tab === 2){
      retrieveParvaVisty();
    }
  };
  // Effects
  useEffect(() => {
    handleRefresh();
  }, []);

  // Vars
  const handleRefresh = async () => {
    setIsLoading(true);
    await retrieveZeiss();
    setIsLoading(false);
  };

  const retrieveZeiss = async () => {
    return httpService(`/api/article/article`, {
      data: {
        act: 'ArticleLensListZeiss',
      },
    }).then(({ status, data }) => {
      setArticle(state => ({
        ...state,
        models: 200 !== status ? [] : (data || []),
        modelsLoaded: true
      }));
    }).catch(() => {
      setArticle(state => ({ ...state, modelsLoaded: true }));
    });
  };

  const retrieveParvaVisty = async () => {
    return httpService(`/api/article/article`, {
      data: {
        act: 'ArticleLensListParvaVisty',
      },
    }).then(({ status, data }) => {
      setArticle(state => ({
        ...state,
        models: 200 !== status ? [] : (data || []),
        modelsLoaded: true
      }));
    }).catch(() => {
      setArticle(state => ({ ...state, modelsLoaded: true }));
    });
  };

  const handleGoToLensDetail = (article: ArticleModel) => {
    if (!article.ArticleID) {
      return void(0);
    }

    navigation.navigatePath('Public', {
      screen: 'BottomTabs.ArticleStack.ArticleDetail',
      params: [null, null, {
        article_id: article.ArticleID || 0,
        article,
      }]
    });
  };

  const renderZeiss = ({ item, index }: ListRenderItemInfo<ArticleModel>) => {
    const content = item.html;
    return (
      <PressableBox
        key={index}
        style={styles.articleCard}
        onPress={() => handleGoToLensDetail(item)}>

        {!item.ArticleID ? null : (
          <Image source={{ uri: item.ArticleImage }} style={styles.articleCardImage} />
        )}
        <View style={{ flex: 1, marginTop: 5
         }}>
          <View style={[wrapper.row]}>
            <Typography style={{ flex: 1, fontSize: 12, color: '#ccc', textDecorationLine: 'underline' }}>
              NEWS
            </Typography>
            <Typography style={{ fontSize: 10, color: '#ccc' }}>
              {item.ArticlePublishDate}
            </Typography>
          </View>
          <Typography heading>
            {item.ArticleName}
          </Typography>
        </View>
      </PressableBox>
    )
  };

  const renderParvaVisty = ({ item, index }: ListRenderItemInfo<ArticleModel>) => {
    const content = item.html;
    return (
      <PressableBox
        key={index}
        style={styles.articleCard}
        onPress={() => handleGoToLensDetail(item)}>

        {!item.ArticleID ? null : (
          <Image source={{ uri: 'https://optiktunggal.com/img/article/'+item.ArticleImage }} style={styles.articleCardImage} />
        )}
        <View style={{ flex: 1, marginTop: 5
         }}>
          <View style={[wrapper.row]}>
            <Typography style={{ flex: 1, fontSize: 12, color: '#ccc', textDecorationLine: 'underline' }}>
              NEWS
            </Typography>
            <Typography style={{ fontSize: 10, color: '#ccc' }}>
              {item.ArticlePublishDate}
            </Typography>
          </View>
          <Typography heading>
            {item.ArticleName}
          </Typography>
        </View>
      </PressableBox>
    )
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FEFEFE' }}>
      <View style={styles.Tabbed}>
        {[
          { label: 'ZEISS', tab: 1 },
          { label: 'Parva-Visty', tab: 2 },
        ].map((item, index) => (
          <Button
            key={index}
            containerStyle={{
              flex: 1,
              marginHorizontal: 4,
              backgroundColor: colors.white,
              ...shadows[2],
            }}
            label={item.label}
            color={tabActive !== item.tab ? 'transparent' : 'primary'}
            rounded={2}
            onPress={() => handleTabToggle(item.tab)}
          />
        ))}
      </View>

      {tabActive !== 1 ? null : (
        <ScrollView 
          refreshControl={(
            <RefreshControl
              refreshing={isLoading}
              onRefresh={handleRefresh}
              colors={[colors.palettes.primary]}
            />
          )}>
          <View style={{ marginTop: 10, paddingHorizontal: 15, }}>
            <View>
              <Image source={{ uri: 'https://optiktunggal.com/img/product_lens/CP161205012018-04-04_11_05_14.jpg' }} style={styles.imgContLens} />
              <Typography style={{ fontSize: 12, textAlign: 'justify' }}>
                Penglihatan Anda layak mendapatkan yang terbaik. Zeiss adalah perusahaan internasional terdepan dalam dunia optikal dan ofthalmik. 
                Zeiss telah berkontribusi dalam pengembangan teknologi optikal dan ofthalmik selama lebih dari 170 tahun. 
                Teknologi lensa ZEISS kini tersedia di Indonesia, Carl Zeiss Vision bekerja sama dengan Optik Tunggal berkomitmen untuk memberikan Anda layanan dan produk lensa dengan kualitas yang terbaik.
              </Typography>
            </View>
          </View>
          <FlatList
            contentContainerStyle={styles.container}
            data={article.models}
            renderItem={renderZeiss}
            ListEmptyComponent={!article.modelsLoaded ? (
              <View style={[styles.PromotionCardContainer, { marginTop: 8 }]}>
                <View style={styles.articleCard}>
                  <BoxLoading width={300} height={150} rounded={8} />
                  <BoxLoading width={[50, 150]} height={20} />
                  <BoxLoading width={[200, 150]} height={20} />
                </View>
              </View>
            ) : (
              <View style={{ marginTop: 45 }}>
                <Typography textAlign="center">
                  {t(`${''}Data tidak ada.`)}
                </Typography>
              </View>
            )}
          />
        </ScrollView>
      )}

      {tabActive !== 2 ? null : (
        <ScrollView>
          <View style={{ marginTop: 10, paddingHorizontal: 15, }}>
            <View>
              <Image source={{ uri: 'https://optiktunggal.com/img/product_lens/CP161205022017-03-07_12_37_03.jpg' }} style={{ width: 200, height: 50, resizeMode: 'stretch', alignSelf: 'center' }} />
              <Typography style={{ fontSize: 12, textAlign: 'justify' }}>
                Lensa berkualitas yang diproduksi dengan teknik free form, menggunakan desain dan teknologi dari Carl Zeiss Vision, 
                memberikan pilihan bagi para smart shopper untuk lensa yang soft design, jernih dan coating berkualitas.
              </Typography>
            </View>
          </View>
          <FlatList
            contentContainerStyle={styles.container}
            data={article.models}
            renderItem={renderParvaVisty}
            ListEmptyComponent={!article.modelsLoaded ? (
              <View style={[styles.PromotionCardContainer, { marginTop: 8 }]}>
                <View style={styles.articleCard}>
                  <BoxLoading width={64} height={64} rounded={8} />

                  <View style={{ flex: 1, paddingLeft: 12 }}>
                    <BoxLoading width={[100, 150]} height={20} />

                    <BoxLoading width={[140, 200]} height={18} style={{ marginTop: 6 }} />
                    <BoxLoading width={[100, 130]} height={18} style={{ marginTop: 2 }} />
                  </View>
                </View>
              </View>
            ) : (
              <View style={{ marginTop: 45 }}>
                <Typography textAlign="center">
                  {t(`${''}Data tidak ada.`)}
                </Typography>
              </View>
            )}
          />
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 15,
    paddingBottom: 24,
    backgroundColor: colors.white,
    borderColor: '#F3F3F3',
  },
  imgContLens: {
    width: 90,
    height: 90,
    alignSelf: 'center'
  },
  Tabbed: {
    ...wrapper.row,
    marginVertical: 12,
    marginHorizontal: -4,
    paddingHorizontal: 12,
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
  articleCard: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginVertical: 5,
    backgroundColor: '#FEFEFE',
    borderWidth: 2,
    borderColor: '#F3F3F3',
    borderRadius: 5,
  },
  articleCardImage: {
    width: '100%',
    height: 130,
    borderRadius: 5,
    resizeMode: 'stretch',
    backgroundColor: '#F3F3F3',
    borderColor: '#F3F3F3',
  }
});

export default Lens;
