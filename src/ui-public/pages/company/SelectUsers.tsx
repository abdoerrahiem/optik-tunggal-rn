import { RouteProp, useRoute } from '@react-navigation/core';
import React, { useCallback, useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, useWindowDimensions, ToastAndroid, Alert } from 'react-native';
import { View } from 'react-native-animatable';
import { colors, wrapper, shadows } from '../../../lib/styles';
import { PublicHomeStackParamList } from '../../../router/publicBottomTabs';
import { useAppNavigation } from '../../../router/RootNavigation';
import { Modelable, ModelablePaginate, ProductModel, BrandModel, GenderModel } from '../../../types/model';
import { Badge, BottomDrawer, Button, Header, Typography } from '../../../ui-shared/components';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ProductsLoading from '../../loadings/ProductsLoading';
import Products from '../../components/Products';
import { ValueOf } from '../../../types/utilities';
import { httpService } from '../../../lib/utilities';
import { useAppSelector } from '../../../redux/hooks';
import { useTranslation } from 'react-i18next';
import ViewCollapse from '../../components/ViewCollapse';
import { RegisterFields } from '..';

type Fields = {
  namadepan?: string,
  namabelakang?: string,
  hp?: string,
  email?: string,
  ktpLocalName?: string,
  ktp?: string,
  namaktp?: string,
  fotoLocalName?: string,
  foto?: string,
  namafoto?: string,
  gender?: string,
  custExist?: string;
  alamat_rumah?: string;
  // password?: string,
};

function SelectUsers() {
  // Hooks
  const navigation = useAppNavigation();
  const route = useRoute();
  const { width, height } = useWindowDimensions();
  const { categories } = useAppSelector(({ shop }) => shop);
  const { brands } = useAppSelector(({ shop }) => shop);
  const { t } = useTranslation('notification');
  const [profile, setProfile] = useState<RegisterFields | null>(null);
  // States
  const [isLoading, setIsLoading] = useState(false);
  const [userExist, setuserExist] = useState<Modelable<BrandModel>>({
    models: [],
    modelsLoaded: false,
  });
  const [fields, setFields] = useState<Fields>({
    namadepan: '',
    namabelakang: '',
    hp: '',
    email: '',
    namaktp: '',
    namafoto: '',
    gender: '',
    custExist: '',
    alamat_rumah: '',
  });

  // Effects
  useEffect(() => {
    cekUserEksis();
  }, []);

  const cekUserEksis = async () => {
    return httpService(`/api/transaction/transaction`, {
      data: {
        act: 'TrxUsers',
        dt: JSON.stringify({ email: route.params.email }),
      },
    }).then(({ status, data }) => {
      setuserExist(state => ({
        ...state,
        models: 200 !== status ? [] : (data || []),
        modelsLoaded: true
      }));
    }).catch(() => {
      setuserExist(state => ({ ...state, modelsLoaded: true }));
    });
  };

  const kirimOTP = async (email: string, nohp: string, flaq: any) => {
    return httpService(`/api/login/login`, {
      data: {
        act: 'kirimOTPforuserExist',
        dt: JSON.stringify({ email, nohp: nohp, flaq: flaq }),
      },
    }).then(({ status, data }) => {
      if(200 === status){
        navigation.navigatePath('Public', {
          screen: 'Verification',
          params: [{ 
            email : email,
            hp: nohp,
            flaq: flaq
          }],
        })
      }
    }).catch(() => {
      setuserExist(state => ({ ...state, modelsLoaded: true }));
    });
  };

  const handleFieldChange = (field: keyof Fields, value: ValueOf<Fields>) => {
    setFields(state => ({
      ...state,
      [field]: value
    }));
  };

  const brandActive = brands?.find(item => item.id === fields.custExist);

  return (
    <View style={{ flex: 1, backgroundColor: '#FEFEFE' }}>
        <Typography style={{ marginVertical: 10, marginHorizontal: 15, fontSize: 12, textAlign: 'justify' }}>
          {t(`${t('Email anda sudah terdaftar sebagai pelanggan OPTIK TUNGGAL.\nmohon untuk memilih salah satu pengguna dibawah ini dan data-data pengisian anda akan mengikuti yang sudah ada.')}`)}
        </Typography>
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: -15,
            paddingBottom: 30
          }}
        >
          <View>
            {[
              ...(userExist.models || [])
              ].map((item, index) => {
                // const selected = item?.id === fields.custExist;
                const dataList = item?.nm_lengkap+'\n'+item?.email+'\n'+item?.hp;
                // const dataList = 'NAMA LENGKAP'+'\n'+'EMAIL'+'\n'+'No. Handphone';
                return (
                  <View style={styles.cardSelected}>
                    <Button
                      key={index}
                      label={dataList}
                      labelProps={{ type: 'p', textAlign: 'left' }}
                      containerStyle={{
                        borderRadius: -20,
                      }}
                      style={{ justifyContent: 'space-between'}}
                      // onPress={() => handleFieldChange('custExist', item?.id)}
                      onPress={() => Alert.alert( "Pemberitahuan", 'Apakah anda ingin memilih nama '+item?.nm_lengkap+' ini?',
                        [
                          { text: "Tidak", onPress: () => console.log("OK Pressed") },
                          { text: "Ya", onPress: () => kirimOTP(item?.email, item?.hp, 'wa')}
                        ]
                      )}
                      size="lg"
                      // right={(
                      //   <Typography size="md" color={selected ? 'green' : 'primary'}>
                      //     {selected ? <Ionicons name="checkmark-circle" size={22} style={{ marginTop: 10 }} /> : null}
                      //   </Typography>
                      // )}
                    />
                  </View>
                );
              })
            }
          </View>
        </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingTop: 8,
    paddingBottom: 24,
  },
  cardSelected: {
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    marginHorizontal: -10,
    marginTop: 10,
  },
  sorry: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginTop: 120
  },
  wrapper: {
    backgroundColor: colors.white,
    paddingHorizontal: 15,
  },

  header: {
    marginHorizontal: -15,
  },

  filterItem: {
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  filterIcon: {
    width: 24,
    height: 24,
  },
  filterIconBrand: {
    width: 30,
    height: 15,
    resizeMode: 'contain',
  },
  menuContainer: {
    margin: -15,
    padding: 15,
  },
  menuBtnContainer: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    marginBottom: 10,
    borderColor: colors.transparent('palettes.primary', 0.5),
  },
});

export default SelectUsers;