import { RouteProp, useRoute } from '@react-navigation/core';
import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, useWindowDimensions, View, Image } from 'react-native';
import { colors, shadows } from '../../../lib/styles';
import { useAppNavigation } from '../../../router/RootNavigation';
import { ImageAuto, Typography, RenderHtml } from '../../../ui-shared/components';
import { useTranslation } from 'react-i18next';
import { Modelable, ArticleModel, ModelablePaginate } from '../../../types/model';
import { PublicArticleStackParamList } from '../../../router/publicBottomTabs';
import { BoxLoading } from '../../../ui-shared/loadings';
import { httpService } from '../../../lib/utilities';
import ProductsLoading from '../../loadings/ProductsLoading';
import Products from '../../components/Products';

function ArticleDetail() {
  // Hooks
  const navigation = useAppNavigation();
  const route = useRoute<RouteProp<PublicArticleStackParamList, 'ArticleDetail'>>();
  const { t } = useTranslation('notification');
  const { width } = useWindowDimensions();

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [article, setArticle] = useState<Modelable<ArticleModel>>({
    model: null,
    modelLoaded: false,
  });

  const [isRefreshing, setIsRefreshing] = useState(false);


  // Effects
  useEffect(() => {
    
  }, []);
  
  useEffect(() => {
    if (route.params?.article) {
      setArticle(state => ({
        ...state,
        model: route.params.article,
        modelLoaded: true
      }));
    }
  }, [route.params]);

  // Vars
  const handleRefresh = async () => {
    setIsLoading(true);

    await retrieveArtikel();

    setIsLoading(false);
  };

  const retrieveArtikel = async () => {
    return new Promise(resolve => {
      setTimeout(() => {
        setArticle(state => ({
          ...state,
          modelLoaded: true,
        }));

        resolve(null);
      }, 250);
    });
  };

  const { model: articleModel } = article;

  return (
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
      {!article.modelLoaded ? (
        <View>
          <BoxLoading width={width} height={width * 10/16} style={styles.image} />

          <BoxLoading width={[160, 200]} height={22} />
          <BoxLoading width={width - 30} height={18} style={{ marginTop: 12 }} />
          <BoxLoading width={width - 30} height={18} style={{ marginTop: 2 }} />
          <BoxLoading width={width - 30} height={18} style={{ marginTop: 2 }} />
          <BoxLoading width={[240, width - 30]} height={18} style={{ marginTop: 2 }} />
        </View>
      ) : (
        !articleModel? (
          <Typography textAlign="center" style={{ marginVertical: 12 }}>
            {t(`${''}Promotion not found.`)}
          </Typography>
        ) : (
          <View>
            {!articleModel.ArticleImage ? null : (
              <View style={[styles.image, { maxHeight: width }]}>
                <ImageAuto
                  source={{ uri: articleModel.ArticleImage }}
                  width={width - 30}
                  style={{
                    marginHorizontal: 15,
                    marginTop: 16,
                    resizeMode: 'stretch'
                  }}
                />
              </View>
            )}

            {!articleModel.ArticleImage ? null : (
              <>
                <View style={{ paddingTop: 5, paddingHorizontal: 5 }}>
                  <Typography style={{textAlign: 'justify', fontWeight: 'bold'}}>{articleModel.ArticleName}</Typography>
                  {!articleModel.html ? null : (
                    <RenderHtml
                      source={{ html: articleModel.html }}
                      tagsStyles={{
                        p: { marginVertical: 0, height: 'auto', fontSize: 12, marginTop: 10, textAlign: 'justify' },
                        ul: { fontSize: 12, textAlign: 'justify' }
                      }}
                    />
                  )}
                </View>
              </>
            )}
          </View>
        )
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 15,
    paddingBottom: 24,
    backgroundColor: colors.white,
  },

  image: {
    marginHorizontal: -15,
    marginBottom: 16,
  }
});

export default ArticleDetail;
