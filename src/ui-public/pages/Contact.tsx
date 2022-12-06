import { useRoute } from '@react-navigation/core';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, RefreshControl, ScrollView, StyleSheet, useWindowDimensions, View, ListRenderItemInfo, Image, FlatList } from 'react-native';
import { FigmaIcon } from '../../assets/icons';
import { getConfig } from '../../lib/config';
import { colors, wrapper, shadows } from '../../lib/styles';
import { useAppNavigation } from '../../router/RootNavigation';
import { Button, Header, ImageAuto, Typography, PressableBox } from '../../ui-shared/components';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ContactUsModel, Modelable } from '../../types/model';
import Carousel from 'react-native-snap-carousel';
import { BoxLoading } from '../../ui-shared/loadings';
import { httpService } from '../../lib/utilities';

function Contact() {
  // Hooks
  const navigation = useAppNavigation();
  const route = useRoute();
  const { width } = useWindowDimensions();
  const { t } = useTranslation('contact');
  const carouselRef = useRef<any>();
  // States
  const [isLoading, setIsLoading] = useState(false);
  const [contactUs, setContactUs] = useState<Modelable<ContactUsModel>>({
    models: [],
    modelsLoaded: false,
  });

  type SliderState = Modelable<ContactUsModel> & { activeIndex: number; };
  const [slider, setSlider] = useState<SliderState>({
    models: [],
    modelsLoaded: false,
    activeIndex: 0,
  });
  // Effects
  useEffect(() => {
    handleRefresh();
  }, []);

  // Vars
  const handleRefresh = async () => {
    setIsLoading(true);
    retrieveContactUs();
    setIsLoading(false);
  };

  const retrieveContactUs = async () => {
    return httpService(`/api/contactus/contactus`, {
      data: {
        act: 'ContactUsList',
        dt: JSON.stringify({ pageCountLimit: 0 })
      },
    }).then(({ status, data }) => {
      setContactUs(state => ({
        ...state,
        models: 200 !== status ? [] : (data || []),
        modelsLoaded: true
      }));
    }).catch(() => {
      setContactUs(state => ({ ...state, modelsLoaded: true }));
    });
  };

  const renderStore = ({ item, index }: ListRenderItemInfo<ContactUsModel>) => {
    const lat = item.StoreLatitude;
    const long = item.StoreLongitude;
    return (
      <>
      <View style={[wrapper.row, { alignItems: 'center', }]}>
        <Image source={{ uri: 'https://optiktunggal.com/img/store_location/'+item.StoreImage }} 
              style={{ width: '20%', height: 70 }} />
        <View style={{ marginLeft: 10, width: '65%' }}>
          <Typography type="h4" style={{ marginTop: 10, fontSize: 14, }} numberOfLines={2}>
            {item.StoreName} | {item.StoreLocationUnit}
          </Typography>
          <Typography style={{ marginTop: 5, fontSize: 12, textAlign: 'justify'}} numberOfLines={4}>
            {item.StoreAddress}, Phone : { item.StorePhone }, {item.StoreNotes}
          </Typography>
        </View>
      </View>
      <View style={{ height: 1, backgroundColor: '#ccc', marginTop: 10, paddingHorizontal: 10 }}></View>
      </>
    )
  };

  return (
    <View style={{ height: '100%', backgroundColor: '#FEFEFE' }}>
      <Typography type="h4" color="black" textAlign="center" style={{ marginTop: 30, height: 30 }}>
        {`${''}HUBUNGI KAMI`}
      </Typography>

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
      
        <Typography type="h4" color="primary" textAlign="center" style={{ marginTop: 16 }}>
          {`${''}PT. OPTIK TUNGGAL SEMPURNA`}
        </Typography>

        <Typography style={{ marginTop: 8, textAlign: 'center' }}>
          {`Jalan Pintu Air Raya No. 36 K-L, RT. 006, RW. 003, Pasar Baru, Sawah Besar, Kota Jakarta Pusat, DKI Jakarta. KODE POS. 10710`}
        </Typography>

        <Typography style={{ marginTop: 20, fontSize: 13, backgroundColor: '#f1f1f1', paddingVertical: 15, paddingHorizontal: 15, borderRadius: 10 }}>
          <Ionicons name="call-outline" size={18} color={'black'} /> {`0811-1320-3000 / 0811-1351-1000`}
        </Typography>

        <Typography style={{ marginTop: 5, fontSize: 13, backgroundColor: '#f1f1f1', paddingVertical: 15, paddingHorizontal: 15, borderRadius: 10 }}>
          <Ionicons name="print-outline" size={18} color={'black'} /> {`021 - 351 8526 / 021 - 351 8527.`}
        </Typography>

        <Typography style={{ marginTop: 5, fontSize: 13, backgroundColor: '#f1f1f1', paddingVertical: 15, paddingHorizontal: 15, borderRadius: 10 }}>
          <Ionicons name="mail-outline" size={18} color={'black'} /> {`cs-ot@optiktunggal.com`}
        </Typography>

        <Typography style={{ marginTop: 5, fontSize: 13, backgroundColor: '#f1f1f1', paddingVertical: 15, paddingHorizontal: 15, borderRadius: 10 }}>
          <Ionicons name="logo-instagram" size={18} color={'black'} /> {`@optiktunggal`}
        </Typography>

        <Typography style={{ marginTop: 5, fontSize: 13, backgroundColor: '#f1f1f1', paddingVertical: 15, paddingHorizontal: 15, borderRadius: 10 }}>
          <Ionicons name="logo-facebook" size={18} color={'black'} /> {`optuktunggalofficial`}
        </Typography>

        <View style={{ marginTop: 20 }}><Typography style={{ textAlign: 'center', fontWeight: 'bold' }}>OUTLET KAMI</Typography></View>
        <View style={{ height: 1, backgroundColor: '#ccc', marginTop: 10 }}></View>

        {/*Store*/}
        {!contactUs.modelsLoaded ? (
          <View style={[wrapper.row, styles.PromotionCard, { alignItems: 'center' }]}>
            <BoxLoading width={74} height={74} rounded={8} />

            <View style={{ flex: 1, paddingLeft: 12 }}>
              <BoxLoading width={[250, 250]} height={20} />

              <BoxLoading width={[250, 250]} height={18} style={{ marginTop: 6 }} />
              <BoxLoading width={[250, 250]} height={18} style={{ marginTop: 2 }} />
            </View>
          </View>
        ) : (
          <View style={{ marginBottom: 50 }}>
            <FlatList data={contactUs.models} renderItem={renderStore} style={styles.flatList} />
          </View>
        )}
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
  },

  helpLogo: {
    width: 64,
  },
  PromotionCardContainer: {
    marginHorizontal: 0,
    borderRadius: 12,
    backgroundColor: colors.white,
  },
  PromotionCard: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: '#FEFEFE',
  },
  actionBtnContainer: {
    backgroundColor: colors.white,
    borderRadius: 0,
    marginRight: -20,
    color: 'blue'
  },

  flatList: {
      top: 20,
      flex: 1,
  },
  item: {
      height: 60,
      borderBottomWidth: 1,
  },
  title: {
      fontSize: 30,
      left: 10
  },
  subtitle: {
      left: 10,
      fontSize: 15
  }
});

export default Contact;