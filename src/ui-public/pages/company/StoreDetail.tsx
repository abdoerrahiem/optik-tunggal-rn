import { useRoute } from '@react-navigation/core';
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from 'react-i18next';
import { Linking, RefreshControl, ScrollView, StyleSheet, useWindowDimensions, 
         View, ListRenderItemInfo, Image, FlatList, ToastAndroid, Alert, SafeAreaView } from 'react-native';
import { FigmaIcon } from '../../../assets/icons';
import { getConfig } from '../../../lib/config';
import { colors, wrapper, shadows } from '../../../lib/styles';
import { useAppNavigation } from '../../../router/RootNavigation';
import { Button, Header, ImageAuto, Typography, PressableBox, TextField, BottomDrawer } from '../../../ui-shared/components';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ContactUsModel, Modelable } from '../../../types/model';
import Carousel from 'react-native-snap-carousel';
import { BoxLoading } from '../../../ui-shared/loadings';
import { httpService } from '../../../lib/utilities';
import { ErrorState, ValueOf } from '../../../types/utilities';
// import { WebView } from 'react-native-webview';
import MapboxGL from "@react-native-mapbox-gl/maps";

type Fields = {
  search?: string;
};

function StoreDetail() {
  const navigation = useAppNavigation();
  const route = useRoute();
  const { width, height } = useWindowDimensions();
  const { t } = useTranslation('ourstore');
  const carouselRef = useRef<any>();

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [fields, setFields] = useState({
    search: '',
  });
  const [contactUs, setContactUs] = useState<Modelable<ContactUsModel>>({
    models: [],
    modelsLoaded: false,
  });

  const [coordinate, setCoordinate] = useState([route.params?.latitude, route.params?.longitude]);
  const [selected, setSelected] = useState<ContactUsModel>({});

  MapboxGL.setAccessToken(
    "pk.eyJ1Ijoib3B0aWt0dW5nZ2FsIiwiYSI6ImNreWptY2N6ODF1NHkyd3FoZG1taXN5cWgifQ.G06xjHOeLJrk9JiKUQDYCg"
  );
  
  const [action, setAction] = useState('');

  useEffect(() => {
    retrieveContactUs();
  }, []);

  useEffect(() => {

  }, [route.params]);

  const hitungJarak = (lat: any, long: any) => {
    let R = 6371;
    let dLati = (106.773025-lat) * Math.PI/180.0;
    let dlongi = (-6.2034954-long) * Math.PI/180.0;

    let lati1 = (lat)*Math.PI/180.0;
    let lati2 = (106.773025)*Math.PI/180.0;

    let a = Math.pow(Math.sin(dLati / 2), 2) +
            Math.pow(Math.sin(dlongi / 2), 2) *
            Math.cos(lati1) * Math.cos(lati2); 

    let c = 2 * Math.asin(Math.sqrt(a));
    let d = R * c;
    return d;
  }
  // Vars
  const handleRefresh = async () => {
    setIsLoading(true);

    setContactUs(state => ({ ...state, modelsLoaded: false }));
    await retrieveContactUs();

    setIsLoading(false);
  };

  const retrieveContactUs = async () => {
    return httpService(`/api/contactus/contactus`, {
      data: {
        act: 'ContactUsList',
        dt: JSON.stringify({
          pageCountLimit: 0,
          param: "store",
          search: fields.search,
        })
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

  return (
    <SafeAreaView style={{flex: 1}} >
      <View style={[wrapper.row, {backgroundColor: '#FEFEFE', height: 50, borderBottomColor: '#0d674e', borderBottomWidth: 5}]}>
        <PressableBox
            opacity
            onPress={() => navigation.navigatePath('Public', {
                screen: 'BottomTabs.OurStoreStack'
            })}>
            <Typography color="black" style={{ marginVertical: 15, marginHorizontal: 15 }}>
              <Ionicons name="arrow-back" size={18} /> {`${''}Detail Toko`}
            </Typography>
        </PressableBox>
      </View>

      <View style={styles.page}>
        <View style={styles.container}>
          <MapboxGL.MapView style={styles.container} 
            zoomEnabled 
            logoEnabled={false}>
            <MapboxGL.UserLocation 
              visible={true}
              ref={(location) => {console.log('HAHA:', {location})}}
            />
            <MapboxGL.Light />
            <MapboxGL.Images />
            <MapboxGL.Camera 
              zoomLevel={15} 
              centerCoordinate={coordinate}/>
            {/*{renderAnnotations()}*/}

            <MapboxGL.MarkerView id={"marker"} coordinate={coordinate}>
              <View>
                <View style={styles.markerContainer}>
                  <View style={styles.TypographyContainer}>
                    <Typography style={styles.Typography}>
                      {route.params?.storename}

                      {/* {!selected.StoreAddress ? null : (
                        <Typography style={[styles.Typography, { fontWeight: 'normal' }]} numberOfLines={2}>
                          {`\n${selected.StoreAddress}`}
                        </Typography>
                      )} */}
                    </Typography>
                  </View>
                  <Image
                    source={{ uri: 'https://optiktunggal.com/img/store_location/'+ route.params?.images }}
                    style={{
                      marginTop: 4,
                      width: 40,
                      height: 40,
                      borderRadius: 40,
                      backgroundColor: "transparent",
                      resizeMode: "cover",
                    }}
                  />
                </View>
              </View>
            </MapboxGL.MarkerView>
          </MapboxGL.MapView>
        </View>
      </View>
      <View style={{height: 250, backgroundColor: '#FEFEFE'}}>
        <Typography style={{ marginVertical: 16, marginHorizontal: 20, fontWeight: 'bold', }}>
          {route.params?.storename}
        </Typography>
        <Typography style={{ marginHorizontal: 20, fontWeight: 'bold', }}>
          Alamat : {`\n`}
          <Typography style={{textAlign: 'justify'}}>{route.params?.address}</Typography>{`\n`}
          <Typography style={{textAlign: 'justify'}}>{route.params?.note}</Typography>
        </Typography>
        <View style={[wrapper.row, {marginBottom: 120}]}>
          <Typography style={{ marginHorizontal: 20, fontWeight: 'bold', marginTop: 20, flex: 1 }}>
            Nomor telepon : {`\n`}
            <Typography style={{textAlign: 'justify'}}>{route.params?.phone}</Typography>
          </Typography>
          <Button
            containerStyle={{ borderRadius: 10, alignSelf: 'center', marginBottom: 20, marginTop: 20, backgroundColor: '#0078d4' }}
            style={{ minWidth: 50 }}
            onPress={() => Linking.openURL('tel:'+route.params?.waphone)}
          >
            <Ionicons name="call" size={24} color={'#fff'} />
          </Button>
          <Button
            containerStyle={{ borderRadius: 10, alignSelf: 'center', marginLeft: 10, marginBottom: 20, marginTop: 20, backgroundColor: '#0d674e', marginRight: 20 }}
            style={{ minWidth: 50 }}
            onPress={() => Linking.openURL('https://api.whatsapp.com/send/?phone='+route.params?.waphone+'&text=Halo+Optik+Tunggal&app_absent=0')}
          >
            <Ionicons name="logo-whatsapp" size={24} color={'#fff'} />
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  PromotionCard: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: '#FEFEFE',
  },
  flatList: {
      top: 20,
      flex: 1,
  },
  cardLocation: {
    backgroundColor: '#FEFEFE',
    marginHorizontal: 20,
  },
  container: {
    height: "100%",
    width: "100%",
    flex: 1,
  },
  markerContainer: {
    alignItems: "center",
    width: '50%',
    backgroundColor: "transparent",
    height: 'auto',
  },
  map: {
    flex: 1,
  },
  TypographyContainer: {
    backgroundColor: "white",
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    width: '80%',
  },
  Typography: {
    paddingHorizontal: 5,
    flexGrow: 1,
    fontSize: 12,
    fontWeight: 'bold'
  },
  icon: {
    paddingTop: 10,
  },
});

export default StoreDetail;