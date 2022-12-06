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

function ContactLens() {
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

// Effects
  useEffect(() => {
    handleRefresh();
  }, []);

  // Vars
  const handleRefresh = async () => {
    setIsLoading(true);
    await handleTabToggle(tabActive);
    setIsLoading(false);
  };

  const handleTabToggle = (tab: number) => {
    setTabActive(tab === tabActive ? 1 : tab);
    if(tab === 1){
      retrieveSchon();
    }

    if(tab === 2){
      retrieveEdgy();
    }

    if(tab === 3){
      retrieveAcuvue();
    }
  };

  const retrieveSchon = async () => {
    return httpService(`/api/article/article`, {
      data: {
        act: 'ArticleContactLensSchon',
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

  const retrieveEdgy = async () => {
    return httpService(`/api/article/article`, {
      data: {
        act: 'ArticleContactLensEdgy',
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

  const retrieveAcuvue = async () => {
    return httpService(`/api/article/article`, {
      data: {
        act: 'ArticleContactLensAcuvue',
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

  const handleGoToContactLensArticleDetail = (article: ArticleModel) => {
    if (!article.ArticleID) {
      return void(0);
    }

    navigation.navigatePath('Public', {
      screen: 'ContactLensSubCategory',
      params: [null, null, {
        article_id: article.ArticleID || 0,
        article,
      }]
    });
  };

  const renderSchon = ({ item, index }: ListRenderItemInfo<ArticleModel>) => {
    const content = item.html;
    return (
      <PressableBox
        key={index}
        style={styles.articleCard}
        onPress={() => handleGoToContactLensArticleDetail(item)}>

        {!item.ArticleID ? null : (
          <Image source={{ uri: item.ArticleImageThumb }} style={styles.articleCardImage} />
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
          { label: 'Schon', tab: 1 },
          { label: 'Edgy', tab: 2 },
          { label: 'Acuvue', tab: 3 },
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
          <View style={{ marginTop: 10, paddingHorizontal: 15, marginBottom: 15 }}>
            <View>
              <Image source={{ uri: 'https://optiktunggal.com/img/contact_lens/category/CLC191212012019-12-12_11_27_58.jpg' }} style={{ width: '100%', height: 200, resizeMode: 'stretch', alignSelf: 'center' }} />
              <Typography style={{ fontSize: 12, textAlign: 'justify', marginTop: 10 }}>
                {`Schon adalah merek softlens yang menyediakan softlens kosmetik dan juga softlens korektif. Softlens Schon didesain khusus untuk mata orang Indonesia yang mempunyai beragam pilihan, baik itu softlens bening dan juga yang berwarna. Untuk varian softlens bening tersedia pilihan masa pakai harian dan bulanan. Untuk varian softlens berwarna tersedia warna-warna natural dan warna-warna menarik lainnya yang dapat membuat tampilan anda lebih memukau.\n\nDapatkan softlens Schon di semua cabang Optik Tunggal di seluruh Indonesia.`}
              </Typography>
            </View>
          </View>
          <FlatList
            contentContainerStyle={styles.container}
            data={article.models}
            renderItem={renderSchon}
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
        <ScrollView
          refreshControl={(
            <RefreshControl
              refreshing={isLoading}
              onRefresh={handleRefresh}
              colors={[colors.palettes.primary]}
            />
          )}>
          <View style={{ marginTop: 10, paddingHorizontal: 15, marginBottom: 15 }}>
            <View>
              <Image source={{ uri: 'https://www.optiktunggal.com/img/contact_lens/category/CLC191212022019-12-12_14_20_33.jpg' }} style={{ width: '100%', height: 200, resizeMode: 'stretch', alignSelf: 'center' }} />
              <Typography style={{ fontSize: 12, textAlign: 'justify', marginTop: 10 }}>
                {`Lensa ini memberikan kenyamanan dan ketajaman penglihatan pada pengguna. Desain warna 2 tone yang telah disesuaikan dengan mata orang Indonesia. Desain alami dengan lingkaran hitam yang membuat mata terlihat lebih bercahaya. Cocok digunakan untuk sehari-hari maupun untuk acara-acara tertentu.`}
              </Typography>
            </View>
          </View>
          <FlatList
            contentContainerStyle={styles.container}
            data={article.models}
            renderItem={renderSchon}
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

      {tabActive !== 3 ? null : (
        <ScrollView
          refreshControl={(
            <RefreshControl
              refreshing={isLoading}
              onRefresh={handleRefresh}
              colors={[colors.palettes.primary]}
            />
          )}>
          <View style={{ marginTop: 10, paddingHorizontal: 15, marginBottom: 15 }}>
            <View>
              <Image source={{ uri: 'https://www.optiktunggal.com/img/contact_lens/category/CLC191211012019-12-11_11_03_30.jpg' }} style={{ width: '100%', height: 200, resizeMode: 'stretch', alignSelf: 'center' }} />
              <Typography style={{ fontSize: 12, textAlign: 'justify', marginTop: 10 }}>
                {`Selama lebih dari dua puluh tahun, Merek ACUVUE® telah didedikasikan untuk membawa keuntungan bagi perawatan mata untuk individu di seluruh dunia. Sejak transformasi Merek ACUVUE®  di tahun 1998 dengan lensa kontak lunak sekali pakai pertama di dunia, kami dengan penuh semangat berusaha mengejar teknologi-teknologi baru dan standar kualitas tertinggi.`}
              </Typography>
            </View>
          </View>
          <FlatList
            contentContainerStyle={styles.container}
            data={article.models}
            renderItem={renderSchon}
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

export default ContactLens;
