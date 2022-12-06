import { useRoute } from '@react-navigation/core';
import React, { useEffect, useState } from 'react';
import { Image, ListRenderItemInfo, RefreshControl, StyleSheet, useWindowDimensions, View, Alert } from 'react-native';
import { colors, shadows, wrapper } from '../../lib/styles';
import { useAppNavigation } from '../../router/RootNavigation';
import { Button, ImageAuto, PressableBox, RenderHtml, Typography } from '../../ui-shared/components';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { FlatList } from 'react-native-gesture-handler';
import { Modelable, ContactLensModel } from '../../types/model';
import { BoxLoading } from '../../ui-shared/loadings';
import { httpService } from '../../lib/utilities';
import moment from 'moment';

function ContactLens() {
  // Hooks
  const navigation = useAppNavigation();
  const route = useRoute();
  const { t } = useTranslation('notification');
  const { width } = useWindowDimensions();

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [contactlens, setContactLens] = useState<Modelable<ContactLensModel>>({
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

    await retrieveContactLens();

    setIsLoading(false);
  };

  const retrieveContactLens = async () => {
    return httpService(`/api/article/article`, {
      data: {
        act: 'ArticleList',
      },
    }).then(({ status, data }) => {
      setContactLens(state => ({
        ...state,
        models: 200 !== status ? [] : (data || []),
        modelsLoaded: true
      }));
    }).catch(() => {
      setContactLens(state => ({ ...state, modelsLoaded: true }));
    });
  };

  const handleGoToContactLens = (contactlens: ContactLensModel) => {
    if (!contactlens.ContactLensID) {
      return void(0);
    }

    navigation.navigatePath('Public', {
      screen: 'BottomTabs.ArticleStack.ArticleDetail',
      params: [null, null, {
        article_id: contactlens.ContactLensID || 0,
        contactlens,
      }]
    });
  };

  const renderContactLens = ({ item, index }: ListRenderItemInfo<ContactLensModel>) => {
    const content = item.html;

    return (
      <PressableBox
        key={index}
        style={styles.articleCard}
        onPress={() => handleGoToContactLens(item)}>

        {!item.ContactLensID ? null : (
          <Image source={{ uri: 'https://optiktunggal.com/img/article/'+item.ContactLensID }} style={styles.articleCardImage} />
        )}
        <View style={{
            marginTop: 8,
            borderTopWidth: 1,
            borderColor: '#ccc'
          }} />
        <View style={{ flex: 1, marginTop: 10
         }}>
          <Typography heading>
            {item.ContactLensName}
          </Typography>
          <View style={{ height: 1, backgroundColor: '#ccc', marginVertical: 10 }}></View>
          <View style={[wrapper.row, { alignItems: 'center', paddingHorizontal: 5}]}>
            <Typography color="black" style={{ flex: 1, fontSize: 13 }}>
              {item.ContactLensPublishDate}    <Ionicons name="eye-outline" size={16} color={'black'} /> {item.ContactLensView}
            </Typography>
            <Button
              containerStyle={[styles.btnShare]}
              label={t('Bagikan', { count: 1 })}
              labelProps={{ type: 'p', size: 'sm' }}
              labelStyle={{ textAlign: 'center' }}
              size="lg"
              right={(
                <Ionicons name="share-social-outline" size={18} color={'black'} />
              )}
              // onPress={() => navigation.navigatePath('Public', {
              //   screen: 'BottomTabs.NotificationStack.PromotionList'
              // })}
              onPress={() => Alert.alert( "Pemberitahuan", "Fitur ini sedang dikembangkan!",
                            [{text: "Cancel",onPress: () => console.log("Cancel Pressed"),style: "cancel"},
                              { text: "OK", onPress: () => console.log("OK Pressed") }
                            ]
              )}
            />
          </View>
          {/*!content ? null : (
            <View style={{ marginTop: 4, maxHeight: 50 }}>
              <RenderHtml
                contentWidth={width - 30 - (!item.html ? 0 : 76)}
                source={{ html: content }}
              />
            </View>
          )*/}
        </View>
      </PressableBox>
    )
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        contentContainerStyle={styles.container}
        refreshControl={(
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            colors={[colors.palettes.primary]}
          />
        )}
        data={contactlens.models}
        renderItem={renderContactLens}
        ListEmptyComponent={!contactlens.modelsLoaded ? (
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
          <View style={{ marginTop: 15 }}>
            <Typography textAlign="center">
              {t(`${''}Semua sudah ditampilkan.`)}
            </Typography>
          </View>
        )}
      />
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

export default ContactLens;
