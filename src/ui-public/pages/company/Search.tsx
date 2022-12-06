import { RouteProp, useRoute } from '@react-navigation/core';
import React, { useCallback, useEffect, useState } from 'react';
import { Image, FlatList, ScrollView, StyleSheet, Platform,
         useWindowDimensions, ListRenderItemInfo, ViewProps } from 'react-native';
import { View } from 'react-native-animatable';
import { colors, wrapper, shadows } from '../../../lib/styles';
import { PublicHomeStackParamList } from '../../../router/publicBottomTabs';
import { useAppNavigation } from '../../../router/RootNavigation';
import { Modelable, ModelablePaginate, ProductModel, BrandModel, CategoryModel } from '../../../types/model';
import { Typography, Button, TextField, PressableBox } from '../../../ui-shared/components';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ValueOf } from '../../../types/utilities';
import { httpService } from '../../../lib/utilities';
import { useAppSelector } from '../../../redux/hooks';
import { useTranslation } from 'react-i18next';
import { BoxLoading } from '../../../ui-shared/loadings';
import { wrap } from 'lodash';

type OptionsState = {
  filterModalOpen?: boolean;
};

function Search() {
  // Hooks
  const navigation = useAppNavigation();
  const route = useRoute();
  const { width, height } = useWindowDimensions();
  const { categories } = useAppSelector(({ shop }) => shop);
  const { brands } = useAppSelector(({ shop }) => shop);
  const { t } = useTranslation('search');

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState<string | null>(null);
  const [product, setProduct] = useState<Modelable<ProductModel>>({
    models: [],
    modelsLoaded: false,
  });

  useEffect(() => {
  }, [route.params]);

  useEffect(() => {
    retrieveMostFavorite();
  }, []);

  const retrieveMostFavorite = async () => {
    return httpService(`/api/category`, {
      data: {
        act: 'SearchMostFavorite',
      },
    }).then(({ status, data }) => {
      setProduct(state => ({
        ...state,
        models: 200 !== status ? [] : (data || []),
        modelsLoaded: true
      }));
    }).catch(() => {
      setProduct(state => ({ ...state, modelsLoaded: true }));
    });
  };

  const renderMostFavorite = ({ item, index }: ListRenderItemInfo<ProductModel>) => {
    return (
      <>
      <PressableBox
          containerStyle={{ paddingHorizontal: 0, backgroundColor: '#fff' }}
          onPress={() => navigation.navigatePath('Public', {
            screen: 'BottomTabs.HomeStack.ProductDetail',
            params: [null, null, {
              product_id: item.kd_brg || 0,
              product_ds: item.nama_brg || 0,
              merk: item.merk,
              deskripsi: item.description,
            }]
          })}
        >
          <View style={[wrapper.row, { marginTop: 10}]}>
            <Image source={{ uri: item.prd_foto }} 
                   style={{ width: width * 0.2, resizeMode: 'stretch', height: height * 0.07, marginHorizontal: 5}} />
            <View style={{marginHorizontal: 10, flex: 1}}>
              <Typography style={{ marginTop: 0, fontSize: 10 }} numberOfLines={2}>
                {item.nama_brg}
              </Typography>
              <Typography style={{ marginTop: 0, width: width - 30, height: 16, fontSize: 12, color: '#0d674e', fontWeight: 'bold' }} >
                Rp. {item.price}
              </Typography>
            </View>
          </View>
          <View style={{ height: 1, backgroundColor: '#ccc', marginTop: 10, marginHorizontal: 10 }}></View>
        </PressableBox>
      </>
    )
  };

  const handleSearch = () => {
    navigation.navigatePath('Public', {
      screen: 'BottomTabs.HomeStack.SearchNew',
      params: [null, null, {
        search: search
      }]
    });
  };


  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ marginHorizontal: 20 }}>
        <Image source={{ uri: 'https://www.resindaparkmall.com/media/k2/items/cache/ba1b7eb9b8ad142948e3b9dce300b4c6_L.jpg'}} 
                style={{ width: width - 200, backgroundColor: '#ccc', height: 75, alignSelf: 'center', marginBottom: -35 }}/>
        <View style={[wrapper.row]}>
          <PressableBox 
              style={{ backgroundColor: '#0d674e', borderRadius: 10, 
                        paddingHorizontal: 10, paddingVertical: 8, marginTop: 30, marginRight: 10 }}
              onPress={() => navigation.navigatePath('Public', {
                screen: 'BottomTabs.HomeStack'
              })}>
            <Ionicons name="arrow-back" size={20} color={'#FFF'} />
          </PressableBox>
          <TextField
            border
            containerStyle={{ flex: 1, backgroundColor: colors.gray[100], 
                              alignSelf: 'center', marginTop: 25, marginBottom: -5 }}
            style={{
              paddingTop: Platform.OS === 'ios' ? 4 : 2,
              paddingBottom: Platform.OS === 'ios' ? 4 : 2,
              height: 38,
              fontSize: 13,
            }}
            placeholder="Cari Produk.."
            value={search?.toString()}
            onChangeText={(value) => setSearch(value)}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>
        <View style={{ borderBottomColor: '#ccc', borderBottomWidth: 1, marginVertical: 10 }}></View>
        <View>
          <ScrollView
            contentContainerStyle={styles.scroll} >
            {/* <Typography style={{ fontWeight: 'bold' }}>Recent Search</Typography>
            {!product.modelsLoaded ? 
              <>
                <View style={{ marginTop: 5}}>
                  <PressableBox
                    onPress={() => {
                      navigation.navigatePath('Public', {
                        screen: 'BottomTabs.HomeStack.Search',
                        params: [null, null, {
                          search: 'Edgy',
                          keywords: 'cariprd',
                        }]
                      })
                    }}>
                    <Typography style={{marginVertical: 5}}>Edgy</Typography>
                  </PressableBox>
                  <PressableBox
                    onPress={() => {
                      navigation.navigatePath('Public', {
                        screen: 'BottomTabs.HomeStack.Search',
                        params: [null, null, {
                          search: 'Levis',
                          keywords: 'cariprd',
                        }]
                      })
                    }}>
                    <Typography style={{marginVertical: 5}}>Levis</Typography>
                  </PressableBox>
                  <PressableBox
                    onPress={() => {
                      navigation.navigatePath('Public', {
                        screen: 'BottomTabs.HomeStack.Search',
                        params: [null, null, {
                          search: 'New Balance',
                          keywords: 'cariprd',
                        }]
                      })
                    }}>
                    <Typography style={{marginVertical: 5}}>New Balance</Typography>
                  </PressableBox>
                  <PressableBox
                    onPress={() => {
                      navigation.navigatePath('Public', {
                        screen: 'BottomTabs.HomeStack.Search',
                        params: [null, null, {
                          search: 'Agnes',
                          keywords: 'cariprd',
                        }]
                      })
                    }}>
                    <Typography style={{marginVertical: 5}}>Agnes</Typography>
                  </PressableBox>
                </View>
              </>
              : (
              <View style={[wrapper.row, { marginTop: 15}]}>
                <BoxLoading width={width - 275} height={width - 325} style={{ marginHorizontal: -15 }} />
                <View>
                  <BoxLoading width={width - 30} height={16} style={{ marginLeft: 30, marginTop: 0 }} />
                  <BoxLoading width={width - 30} height={16} style={{ marginLeft: 30, marginTop: 5 }} />
                  <BoxLoading width={width - 30} height={16} style={{ marginLeft: 30, marginTop: 5 }} />
                </View>
              </View>
            )} */}
            <Typography style={{ fontWeight: 'bold', marginTop: 10 }}>Produk Terlaris</Typography>
            {!product.modelsLoaded ? 
              <>
                <View style={[wrapper.row, { marginTop: 10}]}>
                  <BoxLoading width={width - 275} height={width - 325} style={{ marginHorizontal: -15 }} />
                  <View>
                    <BoxLoading width={width - 30} height={16} style={{ marginLeft: 30, marginTop: 0 }} />
                    <BoxLoading width={width - 30} height={16} style={{ marginLeft: 30, marginTop: 5 }} />
                    <BoxLoading width={width - 30} height={16} style={{ marginLeft: 30, marginTop: 5 }} />
                  </View>
                </View>
                <View style={[wrapper.row, { marginTop: 5}]}>
                  <BoxLoading width={width - 275} height={width - 325} style={{ marginHorizontal: -15 }} />
                  <View>
                    <BoxLoading width={width - 30} height={16} style={{ marginLeft: 30, marginTop: 0 }} />
                    <BoxLoading width={width - 30} height={16} style={{ marginLeft: 30, marginTop: 5 }} />
                    <BoxLoading width={width - 30} height={16} style={{ marginLeft: 30, marginTop: 5 }} />
                  </View>
                </View>
                <View style={[wrapper.row, { marginTop: 5}]}>
                  <BoxLoading width={width - 275} height={width - 325} style={{ marginHorizontal: -15 }} />
                  <View>
                    <BoxLoading width={width - 30} height={16} style={{ marginLeft: 30, marginTop: 0 }} />
                    <BoxLoading width={width - 30} height={16} style={{ marginLeft: 30, marginTop: 5 }} />
                    <BoxLoading width={width - 30} height={16} style={{ marginLeft: 30, marginTop: 5 }} />
                  </View>
                </View>
                <View style={[wrapper.row, { marginTop: 5}]}>
                  <BoxLoading width={width - 275} height={width - 325} style={{ marginHorizontal: -15 }} />
                  <View>
                    <BoxLoading width={width - 30} height={16} style={{ marginLeft: 30, marginTop: 0 }} />
                    <BoxLoading width={width - 30} height={16} style={{ marginLeft: 30, marginTop: 5 }} />
                    <BoxLoading width={width - 30} height={16} style={{ marginLeft: 30, marginTop: 5 }} />
                  </View>
                </View>
                <View style={[wrapper.row, { marginTop: 5}]}>
                  <BoxLoading width={width - 275} height={width - 325} style={{ marginHorizontal: -15 }} />
                  <View>
                    <BoxLoading width={width - 30} height={16} style={{ marginLeft: 30, marginTop: 0 }} />
                    <BoxLoading width={width - 30} height={16} style={{ marginLeft: 30, marginTop: 5 }} />
                    <BoxLoading width={width - 30} height={16} style={{ marginLeft: 30, marginTop: 5 }} />
                  </View>
                </View>
              </>
              : (
              <View style={[wrapper.row, { marginTop: 15}]}>
                <FlatList data={product.models} renderItem={renderMostFavorite} style={styles.flatList} />
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingTop: 8,
    paddingBottom: 24,
  },
  flatList: {
    flex: 1,
    marginTop: -10
  },
  scroll: {
    flexGrow: 1,
    paddingBottom: 24,
    backgroundColor: colors.white,
  },
  menuBtnContainer: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    marginBottom: 10,
    borderColor: colors.transparent('palettes.primary', 0.5),
  },
  menuContainer: {
    margin: -10,
    padding: 15,
  },
  categoryImage: {
    width: 200,
    height: 100,
    resizeMode: 'contain',
    marginHorizontal: 10,
  },
  brandImage: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
  },
  wrapper: {
    backgroundColor: colors.white,
    paddingHorizontal: 20,
  },
  filterIconBrand: {
    width: 30,
    height: 15,
    resizeMode: 'contain',
  },
  header: {
    marginHorizontal: -15,
  },
  actionBtnContainer: {
    backgroundColor: colors.white,
    borderRadius: 0,
    marginRight: -20,
    color: 'blue'
  },
  sorry: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginTop: 120
  },
  filterItem: {
    backgroundColor: colors.transparent('palettes.primary', 0.1),
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.transparent('palettes.primary', 0.25),
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  filterIcon: {
    width: 24,
    height: 24,
  }
});

export default Search;
