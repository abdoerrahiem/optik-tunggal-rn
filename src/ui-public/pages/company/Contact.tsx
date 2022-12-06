import { useRoute } from '@react-navigation/core';
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from 'react-i18next';
import { Linking, RefreshControl, ScrollView, StyleSheet, useWindowDimensions, View, ListRenderItemInfo, Image, FlatList, ToastAndroid } from 'react-native';
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

function Contact() {
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

  const [coordinates] = useState([106.82150309838204, -6.19540649567783]);

  MapboxGL.setAccessToken(
    "pk.eyJ1Ijoib3B0aWt0dW5nZ2FsIiwiYSI6ImNreWptY2N6ODF1NHkyd3FoZG1taXN5cWgifQ.G06xjHOeLJrk9JiKUQDYCg"
  );

  const [action, setAction] = useState('');

  return (
    <View style={{ backgroundColor: '#FEFEFE', flex: 1, }}>
      <View style={[wrapper.row]}>
        <PressableBox
            opacity
            onPress={() => navigation.navigatePath('Public', {
                screen: 'BottomTabs.HomeStack'
            })}>
            <Typography color="black" style={{ marginVertical: 15, marginHorizontal: 15 }}>
              <Ionicons name="arrow-back" size={18} /> {`${''}Kembali`}
            </Typography>
        </PressableBox>
      </View>
      <View style={{backgroundColor: '#FFFFFF', borderRadius: 10}}>
        <View style={styles.cardLocation}>
          <Typography style={{ marginTop: 16, fontWeight: 'bold' }}>
            {`${''}PT. OPTIK TUNGGAL SEMPURNA`}
          </Typography>

          <Typography style={{ marginTop: 3, marginBottom: 20, textAlign: 'justify' }}>
            {`Jalan Pintu Air Raya No. 36 K-L, RT. 006, RW. 003, Pasar Baru, Sawah Besar, Kota Jakarta Pusat, DKI Jakarta. KODE POS. 10710`}
          </Typography>
          <PressableBox
              opacity
              style={{ marginTop: 5, backgroundColor: '#f1f1f1', paddingVertical: 15, paddingHorizontal: 15, marginHorizontal: 5, borderRadius: 10 }}
              onPress={() => Linking.openURL('whatsapp://send?text=Halo Optik Tunggal&phone=6281113203000')}  >
              <Typography style={{ fontSize: 13 }}><Ionicons name="logo-whatsapp" size={16} color={'green'} /> Customer Service</Typography>
          </PressableBox>
          <Typography style={{ marginTop: 5, fontSize: 13, backgroundColor: '#f1f1f1', paddingVertical: 15, paddingHorizontal: 15, borderRadius: 10 }}>
            <Ionicons name="print-outline" size={16} color={'black'} /> {`021 - 351 8526 / 021 - 351 8527.`}
          </Typography>
          
          <PressableBox
              opacity
              style={{ marginTop: 5, backgroundColor: '#f1f1f1', paddingVertical: 15, paddingHorizontal: 15, marginHorizontal: 5, borderRadius: 10 }}
              onPress={() => Linking.openURL('mailto:cs-ot@optiktunggal.com')}  >
              <Typography style={{ fontSize: 13 }}><Ionicons name="mail-outline" size={16} color={'black'} /> cs-ot@optiktunggal.com</Typography>
          </PressableBox>

          <PressableBox
              opacity
              style={{ marginTop: 5, backgroundColor: '#f1f1f1', paddingVertical: 15, paddingHorizontal: 15, marginHorizontal: 5, borderRadius: 10 }}
              onPress={() => Linking.openURL('https://www.instagram.com/optiktunggal/?hl=en')}  >
              <Typography style={{ fontSize: 13 }}><Ionicons name="logo-instagram" size={16} color={'black'} /> @optiktunggal</Typography>
          </PressableBox>

          <PressableBox
              opacity
              style={{ marginTop: 5, backgroundColor: '#f1f1f1', paddingVertical: 15, paddingHorizontal: 15, marginHorizontal: 5, borderRadius: 10 }}
              onPress={() => Linking.openURL('https://www.facebook.com/optiktunggalofficial/')}  >
              <Typography style={{ fontSize: 13 }}><Ionicons name="logo-facebook" size={16} color={'black'} /> optiktunggalofficial</Typography>
          </PressableBox>

          <PressableBox
              opacity
              style={{ marginTop: 5, backgroundColor: '#f1f1f1', paddingVertical: 15, paddingHorizontal: 15, marginHorizontal: 5, borderRadius: 10 }}
              onPress={() => Linking.openURL('https://www.tiktok.com/@optiktunggalofficial')}  >
              <View style={[wrapper.row]}>
                <Image source={{uri: 'https://seeklogo.com/images/T/tiktok-share-icon-black-logo-29FFD062A0-seeklogo.com.png'}} style={{width: 18, height: 18}}/>
                <Typography style={{ fontSize: 13, textAlignVertical: 'center', marginHorizontal: 5 }}>
                  optiktunggalofficial
                </Typography>
              </View>
          </PressableBox>

          <PressableBox
              opacity
              style={{ marginTop: 5, backgroundColor: '#f1f1f1', paddingVertical: 15, paddingHorizontal: 15, marginHorizontal: 5, borderRadius: 10 }}
              onPress={() => Linking.openURL('https://twitter.com/optik_tunggal')}  >
              <Typography style={{ fontSize: 13 }}><Ionicons name="logo-twitter" size={16} color={'black'} /> @Optik_Tunggal</Typography>
          </PressableBox>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  cardLocation: {
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
    width: '100%',
    height: 50
  },
  Typography: {
    paddingHorizontal: 5,
    flex: 1,
    fontSize: 10,
    fontWeight: 'bold'
  },
  icon: {
    paddingTop: 10,
  },
});

export default Contact;