import { useRoute } from '@react-navigation/core';
import React, { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, useWindowDimensions, View } from 'react-native';
import { colors, wrapper } from '../../../lib/styles';
import { useAppNavigation } from '../../../router/RootNavigation';
import { Modelable } from '../../../types/model';
import { FAQModel } from '../../../types/model/About';
import { RenderHtml, Typography } from '../../../ui-shared/components';
import { BoxLoading } from '../../../ui-shared/loadings';
import CardCollapse from '../../components/CardCollapse';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { httpService } from '../../../lib/utilities';
import { useTranslation } from 'react-i18next';

function FAQ() {
  // Hooks
  const navigation = useAppNavigation();
  const route = useRoute();
  const { width } = useWindowDimensions();
  const { t } = useTranslation('contact');

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [faq, setFaq] = useState<Modelable<FAQModel>>({
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

    await retrieveFaqs();

    setIsLoading(false);
  };

  const retrieveFaqs = async (): Promise<void> => {
    return httpService('/product/list', {
      data: {
        act: 'FAQList',
        dt: JSON.stringify({ comp: '001' }),
      }
    }).then(({ status, data }) => {
      if (200 === status) {
        setFaq(state => ({
          ...state,
          models: data,
          modelsLoaded: true,
        }));
      }
    });
  };

  return (
    <FlatList
      contentContainerStyle={styles.container}
      refreshControl={(
        <RefreshControl
          refreshing={isLoading}
          onRefresh={handleRefresh}
          colors={[colors.palettes.primary]}
        />
      )}
      data={faq.models}
      renderItem={({ item, index}) => (
        <CardCollapse
          key={index}
          header={item.nama}
          style={{ marginTop: index === 0 ? 0 : 0 }}
        >
          {!item.remark ? null : (
            <RenderHtml
              contentWidth={width - 30}
              source={{ html: item.remark }}
              tagsStyles={{
                p: { marginVertical: 0, height: 'auto' }
              }}
            />
          )}

          {item.descriptions?.map((item, index) => (
            <View key={index} style={[wrapper.row, { marginTop: index === 0 ? 0 : 12 }]}>
              <View style={{ marginRight: 6, marginTop: 4 }}>
                <Ionicons name="ellipse" size={10} color={colors.gray[700]} />
              </View>

              <Typography style={{ flex: 1 }}>{item}</Typography>
            </View>
          ))}
        </CardCollapse>
      )}
      ListEmptyComponent={!faq.modelsLoaded ? (
        <View style={{
          padding: 15,
        }}>
          <BoxLoading width={[160, 240]} height={20} />
          <BoxLoading width={[160, 240]} height={20} style={{ marginTop: 20 }} />
          <BoxLoading width={[160, 240]} height={20} style={{ marginTop: 20 }} />
        </View>
      ) : (
        <View style={{ paddingVertical: 16 }}>
          <Typography textAlign="center">
            {t(`Belum ada FAQ yang dapat ditampilkan.`)}
          </Typography>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 15,
    paddingTop: 8,
    paddingBottom: 24,
    backgroundColor: colors.white,
  },
});

export default FAQ;
