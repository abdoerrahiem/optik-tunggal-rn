import { useRoute } from '@react-navigation/core';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, RefreshControl, ScrollView, StyleSheet, useWindowDimensions, View, ListRenderItemInfo, Image, FlatList, ToastAndroid } from 'react-native';
import { FigmaIcon } from '../../../assets/icons';
import { getConfig } from '../../../lib/config';
import { colors, wrapper, shadows } from '../../../lib/styles';
import { useAppNavigation } from '../../../router/RootNavigation';
import { Button, Header, ImageAuto, Typography, PressableBox, TextField, BottomDrawer } from '../../../ui-shared/components';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ContactUsModel, Modelable, CityStoreModel } from '../../../types/model';
import Carousel from 'react-native-snap-carousel';
import { BoxLoading } from '../../../ui-shared/loadings';
import { httpService } from '../../../lib/utilities';
import { ErrorState, ValueOf } from '../../../types/utilities';
// import { WebView } from 'react-native-webview';

type Fields = {
  namaKota?: string;
  CityID?: string;
};

type OptionsState = {
  cities?: CityStoreModel[];
  citiesLoaded?: boolean;
  citiesModalOpen?: boolean;
};

function Contact() {
  // Hooks
  const navigation = useAppNavigation();
  const route = useRoute();
  const { width, height } = useWindowDimensions();
  const { t } = useTranslation('contact');
  const carouselRef = useRef<any>();
  // States
  const [isLoading, setIsLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [contactUs, setContactUs] = useState<Modelable<ContactUsModel>>({
    models: [],
    modelsLoaded: false,
  });
  const [action, setAction] = useState('');
  const [error, setError] = useState<ErrorState<Fields>>({
    fields: [],
    message: undefined,
  });

  const [fields, setFields] = useState<Fields>({
    namaKota: '',
    CityID: '',
  });

  const [options, setOptions] = useState<OptionsState>({
    cities: [],
    citiesLoaded: false,
    citiesModalOpen: false,
  });

  type SliderState = Modelable<ContactUsModel> & { activeIndex: number; };
  const [slider, setSlider] = useState<SliderState>({
    models: [],
    modelsLoaded: false,
    activeIndex: 0,
  });
  // Effects
  useEffect(() => {
    retrieveCity();
    retrieveContactUs();
  }, []);

  // Vars
  const handleRefresh = async () => {
    setIsLoading(true);
    retrieveCity();
    retrieveContactUs();
    setIsLoading(false);
  };

  const handleModalToggle = async (type: string, open: boolean | null = null) => {
    let newState: Partial<OptionsState> = {};

    switch (type) {
      case 'namaKota':
        newState.citiesModalOpen = 'boolean' === typeof open ? open : !options.citiesModalOpen;
        break;
    }

    setOptions(state => ({
      ...state,
      ...newState,
    }));
  };

  const retrieveCity = async () => {

    setOptions(state => ({
      ...state,
    }));

    return httpService(`/api/contactus/contactus`, {
      data: {
        act: 'ContactUsList',
        dt: JSON.stringify({ pageCountLimit: 0, param: "city" })
      },
    }).then(({ status, data }) => {
      if (status === 200) {
        setOptions(state => ({
          ...state,
          cities: data,
          citiesLoaded: true,
        }));
      }
    });
  };

  const retrieveContactUs = async () => {
    return httpService(`/api/contactus/contactus`, {
      data: {
        act: 'ContactUsList',
        dt: JSON.stringify({ pageCountLimit: 0, param: "store" })
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

  const handleFieldChange = (field: keyof Fields, value: ValueOf<Fields>) => {
    const { fields = [] } = error;
    const newState: Partial<Fields> = {
      [field]: value,
    };

    setFields(state => ({
      ...state,
      ...newState,
    }));

    fields.indexOf(field) >= 0 && setError({
      fields: [],
      message: undefined,
    });

    handleModalToggle(field);
  };

  let locationField: keyof Fields = 'namaKota';
  let locationStepRequired = '';
  let locationModalTitle = '';
  let locationModalList: CityStoreModel[] = [];
  let locationModalListLoaded: boolean = false;
  let locationModalOpen = options.citiesModalOpen;

  if (options.citiesModalOpen) {
    locationField = 'namaKota';
    locationModalTitle = t(`${''}Select City`);
    locationModalList = options.cities || [];
    locationModalListLoaded = !!options.citiesLoaded;
  }

  const handleErrorShow = (fields: keyof Fields | Array<keyof Fields>, message: string) => {
    ToastAndroid.show(message, ToastAndroid.SHORT);

    setError({
      fields: 'string' === typeof fields ? [fields] : fields as Array<keyof Fields>,
      message
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
          <Typography type="h4" style={{ marginTop: 10, fontSize: 12, }} numberOfLines={2}>
            {item.StoreName} | {item.StoreLocationUnit}
          </Typography>
          <Typography style={{ marginTop: 5, fontSize: 10, textAlign: 'justify'}} numberOfLines={4}>
            {item.StoreAddress}, Phone : { item.StorePhone }, {item.StoreNotes}
          </Typography>
        </View>
      </View>
      <View style={{ height: 1, backgroundColor: '#ccc', marginTop: 10, paddingHorizontal: 10 }}></View>
      </>
    )
  };

  const textPilih = t(`${''}Pilih`);

  return (
    <View style={{ height: '100%', backgroundColor: '#FEFEFE' }}>
      <View style={[wrapper.row]}>
        <PressableBox
            opacity
            style={{ alignItems: 'center', }}
            onPress={() => navigation.navigatePath('Public', {
                screen: 'BottomTabs.HomeStack'
            })}>
            <Typography color="black" style={{ marginTop: 30, marginHorizontal: 15 }}>
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
      
        <Typography type="h4" color="primary" textAlign="center" style={{ marginTop: 16 }}>
          {`${''}PT. OPTIK TUNGGAL SEMPURNA`}
        </Typography>

        <Typography style={{ marginTop: 8, textAlign: 'center' }}>
          {`Jalan Pintu Air Raya No. 36 K-L, RT. 006, RW. 003, Pasar Baru, Sawah Besar, Kota Jakarta Pusat, DKI Jakarta. KODE POS. 10710`}
        </Typography>

        <View style={[wrapper.row, { width: '100%', paddingHorizontal: 40, marginBottom: 10, marginTop: 20 }]}>
          <View style={[wrapper.row]}>
            <PressableBox
              opacity
              style={{ alignItems: 'center'}}
              onPress={() => Linking.openURL('whatsapp://send?text=Halo Optik Tunggal&phone=6281113203000')}  >
                <Typography style={{ height: 40 }}><Ionicons name="logo-whatsapp" size={16} color={'green'} /> 0811-1320-3000</Typography>
            </PressableBox>
          </View>
          <View style={{ width: '10%' }}></View>
          <View style={[wrapper.row]}>
            <PressableBox
                opacity
                style={{ alignItems: 'center', }}
                onPress={() => Linking.openURL('whatsapp://send?text=Halo Optik Tunggal&phone=6281113511000')}  >
                <Typography style={{ height: 40 }}><Ionicons name="logo-whatsapp" size={16} color={'green'} /> 0811-1351-1000</Typography>
            </PressableBox>
          </View>
        </View>
        
        <Typography style={{ marginTop: -15, fontSize: 13, backgroundColor: '#f1f1f1', paddingVertical: 15, paddingHorizontal: 15, borderRadius: 10 }}>
          <Ionicons name="print-outline" size={18} color={'black'} /> {`021 - 351 8526 / 021 - 351 8527.`}
        </Typography>

        <Typography style={{ marginTop: 5, fontSize: 13, backgroundColor: '#f1f1f1', paddingVertical: 15, paddingHorizontal: 15, borderRadius: 10 }}>
          <Ionicons name="mail-outline" size={18} color={'black'} /> {`cs-ot@optiktunggal.com`}
        </Typography>

        <Typography style={{ marginTop: 5, fontSize: 13, backgroundColor: '#f1f1f1', paddingVertical: 15, paddingHorizontal: 15, borderRadius: 10 }}>
          <Ionicons name="logo-instagram" size={18} color={'black'} /> {`@optiktunggal`}
        </Typography>

        <Typography style={{ marginTop: 5, fontSize: 13, backgroundColor: '#f1f1f1', paddingVertical: 15, paddingHorizontal: 15, borderRadius: 10 }}>
          <Ionicons name="logo-facebook" size={18} color={'black'} /> {`optiktunggalofficial`}
        </Typography>

        <View style={{ marginTop: 20 }}><Typography style={{ textAlign: 'center', fontWeight: 'bold' }}>OUTLET KAMI</Typography></View>
        <View style={{ height: 1, backgroundColor: '#ccc', marginTop: 10 }}></View>

        <PressableBox
          containerStyle={{ overflow: 'visible', marginTop: 12 }}
          opacity={1}
          onPress={() => handleModalToggle('namaKota', true)}>

          <TextField
            placeholder={`${''}Cari Berdasarkan Kota`}
            value={options.cities?.find(({ CityID }) => CityID === fields.namaKota)?.CityName}
            editable={false}
            underlineColorAndroid="transparent"
            style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 5, paddingLeft: 20, color: '#333' }}
            pointerEvents="none"
          />
        </PressableBox>

        {/*Store*/}
        {!contactUs.modelsLoaded ? (
          <View style={[wrapper.row, styles.PromotionCard, { alignItems: 'center', marginTop: 20 }]}>
            <BoxLoading width={74} height={74} rounded={8} />

            <View style={{ flex: 1, paddingLeft: 12 }}>
              <BoxLoading width={[250, 250]} height={20} />

              <BoxLoading width={[250, 250]} height={18} style={{ marginTop: 6 }} />
              <BoxLoading width={[250, 250]} height={18} style={{ marginTop: 2 }} />
            </View>
          </View>
        ) : (
          <View style={{ marginBottom: 20 }}>
            <FlatList data={contactUs.models} renderItem={renderStore} style={styles.flatList} />
          </View>
        )}
      
      {/* Popup Provinces */}
      <BottomDrawer
        isVisible={locationModalOpen}
        swipeDirection={null}
        onBackButtonPress={() => handleModalToggle('location', false)}
        onBackdropPress={() => handleModalToggle('location', false)}
        title={locationModalTitle}
        style={{ maxHeight: height * 0.75 }}
      >
        {!locationModalOpen ? null : (
          locationStepRequired ? (
            // Required to select parent location
            <View style={styles.modalContainer}>
              <Typography>{locationStepRequired}</Typography>
            </View>
          ) : (
            !locationModalListLoaded ? (
              // Show loading
              <View style={styles.modalContainer}>
                {[1, 2, 3].map((item, index) => (
                  <BoxLoading
                    key={index}
                    width={[190, 240]}
                    height={20}
                    style={{ marginTop: index === 0 ? 0 : 12 }}
                  />
                ))}
              </View>
            ) : (
              // Location List
              <FlatList
                data={locationModalList}
                style={{ maxHeight: height * 0.66 }}
                contentContainerStyle={styles.modalContainer}
                renderItem={({ item, index }) => (
                  <Button
                    key={index}
                    label={item.CityName}
                    labelProps={{ type: 'p' }}
                    labelStyle={{ flex: 1, textAlign: 'left' }}
                    containerStyle={{
                      backgroundColor: fields[locationField] === item.CityID ? colors.gray[300] : undefined,
                    }}
                    style={{ paddingVertical: 15 }}
                    onPress={() => handleFieldChange(locationField, item.CityID)}
                    right={(
                      <Typography color="primary">
                        {textPilih}
                      </Typography>
                    )}
                  />
                )}
              />
            )
          )
        )}
      </BottomDrawer>
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
  modalContainer: {
    paddingHorizontal: 15,
    paddingTop: 12,
    paddingBottom: 24
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