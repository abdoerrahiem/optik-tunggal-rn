import { useRoute } from '@react-navigation/core';
import React, { useEffect, useState } from 'react';
import { Image, ListRenderItemInfo, RefreshControl, StyleSheet, useWindowDimensions, View, Alert, ScrollView } from 'react-native';
import { colors, shadows, wrapper } from '../../lib/styles';
import { useAppNavigation } from '../../router/RootNavigation';
import { Button, ImageAuto, PressableBox, RenderHtml, Typography } from '../../ui-shared/components';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { FlatList } from 'react-native-gesture-handler';
import { Modelable, ArticleModel } from '../../types/model';
import { BoxLoading } from '../../ui-shared/loadings';
import { httpService } from '../../lib/utilities';
import moment from 'moment';

function Article() {
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

  // Effects
  useEffect(() => {
    handleRefresh();
  }, []);

  // Vars
  const handleRefresh = async () => {
    setIsLoading(true);

    await retrieveArticle();

    setIsLoading(false);
  };

  const retrieveArticle = async () => {
    return httpService(`/api/article/article`, {
      data: {
        act: 'ArticleList',
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

  const handleGoToArticleDetail = (article: ArticleModel) => {
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

  const renderarticles = ({ item, index }: ListRenderItemInfo<ArticleModel>) => {
  const content = item.html;

    return (
      <PressableBox
        key={index}
        style={styles.articleCard}
        onPress={() => handleGoToArticleDetail(item)}>

        {/*{!item.ArticleID ? null : (
          <Image source={{ uri: item.ArticleImage }} style={styles.articleCardImage} />
        )}
        <View style={{
            marginTop: 8,
            borderTopWidth: 1,
            borderColor: '#ccc'
          }} />*/}
        <View style={{ flex: 1, marginTop: 10
         }}>
          <Typography color="gray" style={{ flex: 1, fontSize: 10 }}>
            {item.ArticlePublishDate}
          </Typography>
          <Typography style={{ fontSize: 13 }}>
            {item.ArticleName}
          </Typography>
        </View>
      </PressableBox>
    )
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        refreshControl={(
          <RefreshControl
            refreshing={false}
            onRefresh={handleRefresh}
            colors={[colors.palettes.primary]}
          />
        )}
      >
        <FlatList
          contentContainerStyle={styles.container}
          refreshControl={(
            <RefreshControl
              refreshing={isLoading}
              onRefresh={handleRefresh}
              colors={[colors.palettes.primary]}
            />
          )}
          data={article.models}
          renderItem={renderarticles}
          ListEmptyComponent={!article.modelsLoaded ? (
            <View style={[styles.PromotionCardContainer, { marginTop: 8 }]}>
              <View style={styles.articleCard}>
                <BoxLoading width={300} height={150} rounded={8} />
                <BoxLoading width={[50, 150]} height={20} />
                <BoxLoading width={[200, 150]} height={20} />
              </View>
            </View>
          ) : (
            <View style={{ marginTop: 15 }}>
              <Typography textAlign="center">
                {t(`${''}Semua Kabar sudah ditampilkan.`)}
              </Typography>
            </View>
          )}
        />
      </ScrollView>
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

export default Article;
