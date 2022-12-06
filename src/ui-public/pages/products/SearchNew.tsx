import { RouteProp, useRoute } from '@react-navigation/core';
import React, { useCallback, useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, useWindowDimensions, Platform, Alert } from 'react-native';
import { View } from 'react-native-animatable';
import { colors, wrapper, shadows } from '../../../lib/styles';
import { PublicHomeStackParamList } from '../../../router/publicBottomTabs';
import { useAppNavigation } from '../../../router/RootNavigation';
import { Modelable, ModelablePaginate, ProductModel, BrandModel, ColorModel, GenderModel, BrandCLModel } from '../../../types/model';
import { Badge, BottomDrawer, Button, Header, Typography, PressableBox, TextField } from '../../../ui-shared/components';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ProductsLoading from '../../loadings/ProductsLoading';
import Products from '../../components/Products';
import { ValueOf } from '../../../types/utilities';
import { httpService } from '../../../lib/utilities';
import { useTranslation } from 'react-i18next';
import ViewCollapse from '../../components/ViewCollapse';
import { BoxLoading } from '../../../ui-shared/loadings';
import { fetchBrandColorCL, fetchBrandClearCL } from '../../../redux/actions/shopActions';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';

const SORT = [
  { label: `${''}Semua harga`, value: '0' },
  { label: `${''}Rp. 0 - 1.300.000`, value: '1' },
  { label: `${''}Rp. 1.300.001 - Rp. 2.000.000`, value: '2' },
  { label: `${''}Rp. 2.000.001 - Rp. 4.000.000`, value: '3' },
  { label: `${''}Rp. 4.000.001 - Rp. 7.000.000`, value: '4' },
  { label: `${''}> Rp. 7.000.001`, value: '5' },
];

const SORTCLSLACS = [
  { label: `${''}Harga Terendah`, value: 'lowprice', icon: 'ios-arrow-down-circle-sharp' },
  { label: `${''}Harga Tertinggi`, value: 'highprice', icon: 'ios-arrow-up-circle-sharp' },
];

const CATEGORY = [
  { label: `${''}Semua Kategori`, value: 'isAll' },
  { label: `${''}Frame`, value: 'isFrame' },
  { label: `${''}Sunglass`, value: 'isSunglass' },
  { label: `${''}Contact Lens`, value: 'isLens' },
  { label: `${''}Solutions`, value: 'isSol' },
  { label: `${''}Accessories`, value: 'isAccs' },
];

type Fields = {
  sort?: string;
  prdcat?: string;
  // prdgender?: string;
  brand?: string;
  warna?: string;
  catsort?: string;
};

type OptionsState = {
  filterModalOpen?: boolean;
  prdcat?: string;
  // prdgender?: string;
  brand?: string;
  warna?: string;
  catsort?: string;
};

function SearchNew() {
  // Hooks
  const navigation = useAppNavigation();
  const route = useRoute<RouteProp<PublicHomeStackParamList, 'Search'>>();
  const { width, height } = useWindowDimensions();
  const { categories } = useAppSelector(({ shop }) => shop);
  const { brands } = useAppSelector(({ shop }) => shop);
  const { clbrands } = useAppSelector(({ shop }) => shop);
  // const { brandsOther } = useAppSelector(({ shop }) => shop);
  const { warnas } = useAppSelector(({ shop }) => shop);
  const { t } = useTranslation('home');
  const dispatch = useAppDispatch();

  const [brandClearCL, setBrandClearCL] = useState<Modelable<BrandCLModel>>({
    models: [],
    modelsLoaded: false,
  });
  const [brandColorCL, setBrandColorCL] = useState<Modelable<BrandCLModel>>({
    models: [],
    modelsLoaded: false,
  });
  // States
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState<string | null>(null);
  const [product, setProduct] = useState<ModelablePaginate<ProductModel>>({
    models: [],
    modelsLoaded: false,
    page: 1,
    perPage: 12,
    isPageEnd: false,
  });
  const [brand, setBrand] = useState<Modelable<BrandModel>>({
    models: [],
    modelsLoaded: false,
  });
  const [warna, setWarna] = useState<Modelable<ColorModel>>({
    models: [],
    modelsLoaded: false,
  });
  // const [brandLain, setBrandLain] = useState<Modelable<BrandCLModel>>({ // CL itu Contact Lens
  //   models: [],
  //   modelsLoaded: false,
  // });
  const [gender, setGender] = useState<Modelable<GenderModel>>({
    models: [],
    modelsLoaded: false,
  });
  const [fields, setFields] = useState<Fields>({
    sort: '',
    prdcat: '',
    // prdgender: '',
    brand: '',
    warna: '',
    catsort: ''
  });
  const [options, setOptions] = useState<OptionsState>({
    filterModalOpen: false,
    prdcat: '',
    // prdgender: '',
    brand: '',
    warna: '',
    catsort: ''
  });

  const [tampilBrandFilter, setTampilBrandFilter] = useState(false);
  // const [tampilBrandSolution, setTampilBrandSolution] = useState(false);
  const [tampilGender, setTampilGender] = useState(false);
  const [tampilPriceSol, setTampilPriceSol] = useState(false);
  const [tampilPriceDefault, setTampilPriceDefault] = useState(false);
  const [notifFilter, setNotifFilter] = useState(false);
  const [contactLensView, setcontactLensView] = useState(false);
  const mode = false;
  // Effects
  useEffect(() => {
    setProduct(state => ({
      ...state,
      page: 1
    }));
    changeState(mode);
  }, []);

  useEffect(() => {
    const { search: routeSearch, category: routeCategory, brand: routeBrand } = route.params;
    routeSearch && setSearch(routeSearch);
    if (routeCategory) {
      handleFieldChangeOld('prdcat', routeCategory.id);

      setOptions(state => ({ ...state, prdcat: routeCategory.id }));
    }else if (routeBrand) {
        handleFieldChangeOld('brand', routeBrand.id);

      setOptions(state => ({ ...state, brand: routeBrand.id }));
    }

    if (!product.isPageEnd) {
      retrieveProducts(product.page, '');
    }

  }, [route.params, product.page]);

  // useEffect(() => {
  //   if (!product.isPageEnd) {
  //     retrieveProducts(product.page, '');
  //   }
  // }, [product.page]);

  useEffect(() => {
    setProduct(state => ({
      ...state,
      models: [],
      modelsLoaded: false,
      page: 1,
      isPageEnd: false,
    }));

    // product.page === 1 && retrieveProducts();
  }, [search]);

  const handleRefresh = async (prdPage: number) => {
    setIsLoading(true);
    retrieveProducts(prdPage, '');
    dispatch(fetchBrandClearCL()).unwrap().then((results) => {
      setBrandClearCL(state => ({
        ...state,
        models: results,
        modelsLoaded: true
      }));
    }).catch(() => {
      setBrandClearCL(state => ({ ...state, modelsLoaded: true }));
    });

    dispatch(fetchBrandColorCL()).unwrap().then((results) => {
      setBrandColorCL(state => ({
        ...state,
        models: results,
        modelsLoaded: true
      }));
    }).catch(() => {
      setBrandColorCL(state => ({ ...state, modelsLoaded: true }));
    });
    setIsLoading(false);
  };
  

  // Vars
  const retrieveProducts = async (page: number = 1, keywords: string) => {
    const reccnt = product.perPage * (page <= 1 ? 0 : page);
    const katakunci = keywords == '' ? route.params.keywords : keywords;
    
    setIsLoading(true);
    setProduct(state => ({ ...state, modelsLoaded: false }));

    return httpService('/api/product/product', {
      data: {
        act: 'PrdListKatalog',
        dt: JSON.stringify({
          reccnt,
          pg: page,
          limit: product.perPage,
          search: !katakunci ? route.params.search : katakunci,
          keyword: !route.params.keywords ? null : route.params.keywords,
          color: !route.params.color ? null : route.params.color,
          merk: !route.params.merk ? null : route.params.merk,
          prdid: 'kosong',
          ...fields
        }),
      },
    }).then(({ status, data }) => {
      setIsLoading(false);

      if (200 === status) {
        setProduct(state => ({
          ...state,
          models: [...(state.models || []), ...data],
          modelsLoaded: true,
          isPageEnd: !data?.length,
        }));
      }/*else if(201 === status){
        Alert.alert( "Pemberitahuan", "Produk yang dicari tidak ditemukan.",
          [
            { text: "Cari lagi", onPress: () => { 
              navigation.navigatePath('Public', { 
                screen: 'Search',
              }); 
            }}
          ]
        );
      }*/
    }).catch(err => {
      setIsLoading(false);
      setProduct(state => ({ ...state, modelsLoaded: true }));
    });
  };

  const retrieveOtherBrand = async (jenis: String) => {
    return httpService('/api/brand/brand', {
      data: {
        act: 'SolutionsBrand',
        dt: JSON.stringify({ jns: jenis }),
      }
    }).then(({ status, data }) => {
      if (200 === status) {
        setBrand(state => ({
          ...state,
          models: data,
          modelsLoaded: true
        }));
      }
    }).catch((err) => {
      // 
    });
  };

  const retrieveBrands = async (jenis: String) => {
    let parameter = jenis == '' ? null : JSON.stringify({ jns: jenis });
    let action = jenis == '' ? 'BrandList' : 'SolutionsBrand';

    return httpService('/api/brand/brand', {
      data: {
        act: action,
        dt: parameter
      }
    }).then(({ status, data }) => {
      if (200 === status) {
        setBrand(state => ({
          ...state,
          models: data,
          modelsLoaded: true
        }));
      }
    }).catch((err) => {
      // 
    });
  };

  const retrieveGenders = async () => {
    return httpService('/api/category', {
      data: {
        act: 'PrdGenderList',
        dt: JSON.stringify({ comp: '001' }),
      },
    }).then(({ status, data }) => {
      if (status === 200) {
        setGender(state => ({
          ...state,
          models: data,
          modelsLoaded: true
        }));
      }
    });
  };

  const handleModalToggle = async (type: string, open: boolean | null = null) => {
    switch (type) {
      case 'filter':
        setOptions(state => ({
          ...state,
          filterModalOpen: 'boolean' === typeof open ? open : !options.filterModalOpen
        }));
        break;
    }
  };

  const handleFieldChangeOld = (field: keyof Fields, value: ValueOf<Fields>) => {
    // Alert.alert( "Pemberitahuan", "Brand : "+value);
    setFields(state => ({
      ...state,
      [field]: value
    }));
  };

  const handleFieldChangeNew = (field: keyof Fields, value: ValueOf<Fields>) => {
    changeState(value);
    setFields(state => ({
    ...state,
    [field]: value
    }));
  };

  let filterCount = 0;

  fields.sort && filterCount++;
  fields.prdcat && filterCount++;
  fields.brand && filterCount++;

  const filterColor = filterCount ? colors.palettes.primary : colors.gray[700];
  const categoryActive = categories?.find(item => item.id === fields.prdcat);
  const brandActive = brands?.find(item => item.id === fields.brand);
  const colorClActive = clbrands?.find(item => item.id === fields.brand);
  const priceActive = SORT?.find(item => item.value === fields.sort);
  const priceSolActive = SORTCLSLACS?.find(item => item.value === fields.sort);
  const catActive = CATEGORY?.find(item => item.value === fields.catsort); // Frame, sunglass, contactlens, solution and accessories

  const contactLensFilter = contactLensView?(
    <View>
      <Typography type="h5" style={{ paddingVertical: 5 }}>
          {`${t('Pilih Jenis Contact Lens')}`}
      </Typography>
      <ScrollView style={{height: 270}}>
        <View style={{ marginTop: 0 }}>
          <ViewCollapse
              style={styles.menuContainer}
              pressableProps={{
              containerStyle: styles.menuBtnContainer,
              }}
              header={t(`${''}Clear`)}
              headerProps={{
              type: 'h',
              }}
              collapse
          >
              {[
              {
                  id: '',
                  name: t(`${t('All Brand')}`),
              },
              ...(brandClearCL.models || [])
              ].map((item, index) => {
                  const selected = item?.id === fields.brand;
                  return (
                  <Button
                      key={index}
                      labelProps={{ type: 'p' }}
                      containerStyle={{
                        marginTop: index > 0 ? 4 : 0,
                        backgroundColor: selected ? colors.transparent('#0d674e', 0.1) : undefined,
                      }}
                      style={{ justifyContent: 'space-between' }}
                      onPress={() => handleFieldChangeOld('brand', item.id)}
                      size="lg"
                      right={(
                      <Typography size="sm" color={selected ? '#0d674e' : 'primary'}>
                          {selected ? <Ionicons name="md-checkbox" size={16} color={'#0d674e'} /> : null}
                      </Typography>
                      )}
                  >
                      <Typography style={{ marginLeft: 5}}>{item.name}</Typography>
                  </Button>
                  );
              })
              }
          </ViewCollapse>
        </View>
        <View style={{ marginTop: 0 }}>
          <ViewCollapse
              style={styles.menuContainer}
              pressableProps={{
              containerStyle: styles.menuBtnContainer,
              }}
              header={t(`${''}Color`)}
              headerProps={{
              type: 'h',
              }}
              collapse
          >
              {[
              {
                  id: '',
                  name: t(`${t('All Brand')}`),
              },
              ...(brandColorCL.models || [])
              ].map((item, index) => {
                  const selected = item?.id === fields.brand;
                  return (
                  <Button
                      key={index}
                      labelProps={{ type: 'p' }}
                      containerStyle={{
                        marginTop: index > 0 ? 4 : 0,
                        backgroundColor: selected ? colors.transparent('#0d674e', 0.1) : undefined,
                      }}
                      style={{ justifyContent: 'space-between' }}
                      onPress={() => handleFieldChangeOld('brand', item.id)}
                      size="lg"
                      right={(
                      <Typography size="sm" color={selected ? '#0d674e' : 'primary'}>
                          {selected ? <Ionicons name="md-checkbox" size={16} color={'#0d674e'} /> : null}
                      </Typography>
                      )}
                  >
                      <Typography style={{ marginLeft: 5}}>{item.name}</Typography>
                  </Button>
                  );
              })
              }
          </ViewCollapse>
        </View>
      </ScrollView>
    </View>
  ) : null;

  const NotifDiFilter = notifFilter?(
    <View style={{marginTop: 30}}>
        <Typography style={{textAlign: 'center'}}>
            {`Klik Apply Filter untuk tetap melakukan pencarian`} "{catActive?.label}"
        </Typography>
    </View>
  ) : null;

  const BrandFilter = tampilBrandFilter? (
    <View style={{ marginTop: 0 }}>
        <ViewCollapse
            style={styles.menuContainer}
            pressableProps={{
            containerStyle: styles.menuBtnContainer,
            }}
            header={t(`${''}Brand`)}
            headerProps={{
            type: 'h',
            }}
            collapse
        >
            {[
            {
                id: '',
                name: t(`${t('All Brand')}`),
            },
            ...(brand.models || [])
            ].map((item, index) => {
                const selected = item?.id === fields.brand;
                return (
                <Button
                    key={index}
                    labelProps={{ type: 'p' }}
                    containerStyle={{
                    marginTop: index > 0 ? 4 : 0,
                    backgroundColor: selected ? colors.transparent('#0d674e', 0.1) : undefined,
                    }}
                    style={{ justifyContent: 'space-between' }}
                    onPress={() => handleFieldChangeOld('brand', item.id)}
                    size="lg"
                    right={(
                    <Typography size="sm" color={selected ? '#0d674e' : 'primary'}>
                        {selected ? <Ionicons name="md-checkbox" size={16} color={'#0d674e'} /> : null}
                    </Typography>
                    )}
                >
                    <Typography style={{ marginLeft: 5}}>{item.name}</Typography>
                </Button>
                );
            })
            }
        </ViewCollapse>
    </View>
  ) : null ;

  const GenderFilter = tampilGender? (
    <ViewCollapse
        style={styles.menuContainer}
        pressableProps={{
            containerStyle: styles.menuBtnContainer,
        }}
        header={t(`${''}Gender`)}
        headerProps={{
            type: 'h',
        }}
        collapse
        >
        {!categories?.length ? (
            <Typography>
            {t(`${t('No Gender')}`)}
            </Typography>
        ) : (
            [
            {
                id: '',
                ds: t(`${t('All Gender')}`),
            },
            ...categories
            ].map((item, index) => {
            const selected = item?.id === fields.prdcat;
            // const selected = item?.id === fields.prdcat;

            return (
                <Button
                key={index}
                label={item.ds}
                labelProps={{ type: 'p' }}
                containerStyle={{
                    marginTop: index > 0 ? 4 : 0,
                    backgroundColor: selected ? colors.transparent('#0d674e', 0.1) : undefined,
                }}
                style={{ justifyContent: 'space-between' }}
                // onPress={() => setOptions(state => ({ ...state, prdcat: item.id }))}
                onPress={() => handleFieldChangeOld('prdcat', item.id)}
                size="lg"
                right={(
                    <Typography size="sm" color={selected ? '#0d674e' : 'primary'}>
                    {selected ? <Ionicons name="md-checkbox" size={16} color={'#0d674e'} /> : null}
                    </Typography>
                )}
                />
            );
            })
        )}
    </ViewCollapse>
  ) : null;

  const PriceDefault = tampilPriceDefault? (
    <View>
        <Typography type="h5" style={{ paddingBottom: 8 }}>
            {`${t('Price')}`}
        </Typography>

        <View style={[wrapper.row, { flexWrap: 'wrap' }]}>
            {SORT.map((item, index) => (
            <Button
                key={index}
                containerStyle={{
                marginBottom: 8,
                marginRight: 5,
                borderColor: fields.sort === item.value ? colors.transparent('#0d674e', 1) : colors.gray[400],
                }}
                border
                onPress={() => handleFieldChangeOld('sort', item.value)}
            >
                <Typography
                style={{
                    color: fields.sort === item.value ? '#0d674e' : colors.gray[900],
                    fontSize: 12,
                    marginHorizontal: 5
                }}
                >
                {t(`${''}${item.label}`)}
                </Typography>
            </Button>
            ))}
        </View>
    </View>
  ) : null;

  const PriceSol = tampilPriceSol? (
    <View>
      <Typography type="h5" style={{ paddingBottom: 8 }}>
          {`${t('Price')}`}
      </Typography>

      <View style={[wrapper.row, { flexWrap: 'wrap' }]}>
          {SORTCLSLACS.map((item, index) => (
          <Button
              key={index}
              containerStyle={{
              marginBottom: 8,
              marginRight: 8,
              borderColor: fields.sort === item.value ? colors.transparent('#0d674e', 1) : colors.gray[400],
              }}
              labelProps={{ color: fields.sort === item.value ? '#0d674e' : colors.gray[900] }}
              size="sm"
              border
              onPress={() => handleFieldChangeOld('sort', item.value)}
          >
              <Typography>
              <Ionicons
                  name={item.icon}
                  size={18}
                  color={'#333'}
              /> {t(`${''}${item.label}`)}</Typography>
          </Button>
          ))}
      </View>
    </View>
  ) : null;
  
  const changeState = (mode: any) => {
    switch (mode) {
        case 'isFrame':
            setNotifFilter(false);
            setTampilPriceDefault(true);
            setTampilBrandFilter(true);
            setTampilGender(true);
            setTampilPriceSol(false);
            retrieveBrands('');
            retrieveGenders();
            setcontactLensView(false);
            fields.sort = '';
            break;
        case 'isSunglass':
            setNotifFilter(false);
            setTampilPriceDefault(true);
            setTampilBrandFilter(true);
            setTampilGender(true);
            setTampilPriceSol(false);
            retrieveBrands('');
            retrieveGenders();
            setcontactLensView(false);
            fields.sort = '';
            fields.prdcat = '';
            break;
        case 'isLens':
            setNotifFilter(false);
            setTampilPriceDefault(false);
            setTampilBrandFilter(false);
            setTampilGender(false);
            setTampilPriceSol(false);
            setcontactLensView(true);
            fields.brand = '';
            fields.sort = '';
            fields.prdcat = '';
            break;
        case 'isSol':
            setNotifFilter(false);
            setTampilPriceDefault(false);
            setTampilBrandFilter(true);
            setTampilPriceSol(true);
            setTampilGender(false);
            retrieveBrands('solutions');
            setcontactLensView(false);
            fields.brand = '';
            fields.sort = '';
            fields.prdcat = '';
            break;
        case 'isAccs':
            setNotifFilter(true);
            setTampilPriceDefault(false);
            setTampilBrandFilter(false);
            setTampilGender(false);
            setTampilPriceSol(false);
            setcontactLensView(false);
            fields.brand = '';
            fields.sort = '';
            fields.prdcat = '';
            break;
        case 'isAll':
            setTampilPriceDefault(false);
            setTampilBrandFilter(false);
            setTampilGender(false);
            setTampilPriceSol(false);
            setcontactLensView(false);
            fields.brand = '';
            fields.sort = '';
            fields.prdcat = '';
        default:
            setTampilPriceDefault(false);
            setTampilBrandFilter(false);
            setTampilGender(false);
            setTampilPriceSol(false);
            setcontactLensView(false);
            fields.brand = '';
            fields.sort = '';
            break;
    }
  }

  console.log('hasilnya : ', product.modelsLoaded);

  const handleFilterApply = async () => {
    handleModalToggle('filter', false);

    handleFieldChangeOld('prdcat', fields.prdcat);
    // handleFieldChange('brand', options.brand);

    setProduct(state => ({
      ...state,
      page: 1,
      models: [],
      modelsLoaded: false,
      isPageEnd: false,
    }));

    product.page === 1 && await retrieveProducts(product.page, '');
  };

  // Alert.alert( "Pemberitahuan", "Brand : "+product.modelsLoaded);
  return (
    <View style={{ flex: 1 }}>
      <Header
        left="kosong"
        search={search || undefined}
      />

      <View style={[styles.wrapper, { paddingTop: 8, paddingBottom: 12 }]}>
        {route.params?.keywords == 'contactlens' || route.params.keywords == "accessories" ? null :
          (<View style={[wrapper.row, { alignItems: 'center' }]}>
            <Button
              containerStyle={{
                marginLeft: -12,
                borderColor: '#fff',
                backgroundColor: '#0d674e'
              }}
              labelProps={{ type: 'p', color: '#fff' }}
              rounded={8}
              border
              left={(
                <View>
                  <Typography style={{color: '#fff', fontSize: 12}}>Filter <Ionicons name="caret-down" size={10} color={'#fff'} /></Typography>
                </View>
              )}
              onPress={() => handleModalToggle('filter', true)}
            />
            
            <ScrollView
              horizontal={true}
              style={{marginHorizontal: 3}}
            >
              {!catActive ? null : (
                <View style={{marginHorizontal: 5, borderRadius: 5, borderWidth: 1, borderColor: '#ccc'}}>
                  <Typography style={{fontSize: 12, padding: 5}}>
                    {catActive.label} 
                    {!colorClActive ? null : (
                      ' : '+colorClActive.name
                    )}
                    {!brandActive ? null : (
                      ' : '+brandActive.name
                    )}
                  </Typography>
                </View>
              )}

              {!priceSolActive ? null : (
                <Badge
                  style={[styles.filterItem, {marginLeft: 5}]}
                  label={priceSolActive.label}
                  labelProps={{ size: 'sm' }}
                  left={<Ionicons name={priceSolActive.icon} size={12}/>}
                />
              )}

              {!priceActive ? null : (
                <Badge
                  style={[styles.filterItem, {marginLeft: 5}]}
                  label={priceActive.label}
                  labelProps={{ size: 'sm' }}
                />
              )}

              {!categoryActive ? null : (
                <Badge
                  style={[styles.filterItem, { marginLeft: 5 }]}
                  label={categoryActive.ds}
                  labelProps={{ size: 'sm' }}
                />
              )}
            </ScrollView>
          </View>)
        }
      </View>

      <Products
        contentContainerStyle={[styles.container, styles.wrapper, {marginTop: -5,}]}
        refreshing={isLoading}
        onRefresh={handleFilterApply}
        loading={!product.modelsLoaded && !product.isPageEnd}
        onEndReached={() => {
          if (product.modelsLoaded) {
            setProduct(state => ({
              ...state,
              page: state.page + 1,
              modelsLoaded: false,
            }));
          }
        }}
        data={product.models}
        ListEmptyComponent={isLoading === true ? ( 
          <View style={{ marginHorizontal: 10 }}>
            <ProductsLoading />
            <Typography size="sm" textAlign="center" color={700} style={{ marginTop: 16 }}>
              {(`${t('Sedang memuat data...')}`)}
            </Typography>
          </View>
        ) : product.models?.length > 0 ? (
          <View style={{ marginHorizontal: 10 }}>
              <ProductsLoading />
              <Typography size="sm" textAlign="center" color={700} style={{ marginTop: 16 }}>
                {(`${t('Sedang memuat data...')}`)}
              </Typography>
            </View>
          ) : (
            <View style={[styles.container, styles.wrapper]}>
              <Image source={{ uri: 'https://www.callkirana.in/bootstrp/images/no-product.png' }} style={styles.sorry} />
              <Typography textAlign="center" style={{ marginVertical: 12 }}>
                {(`${t('Produk tidak ditemukan')}`)}
              </Typography>
            </View>
        )}
      />

      {/* Popup Filter */}
      <BottomDrawer
        isVisible={options.filterModalOpen}
        swipeDirection={null}
        onBackButtonPress={() => handleModalToggle('filter', false)}
        onBackdropPress={() => handleModalToggle('filter', false)}
        // title="Filter"
        style={{ maxHeight: height * 0.75 }}
      >
        <PressableBox
          containerStyle={{ alignSelf: 'center', marginBottom: 20, backgroundColor: '#0d674e', marginHorizontal: 10 }}
          style={{ minWidth: 350 }}
          onPress={handleFilterApply}
        >
          <Typography style={{ color: '#fff', textAlign: 'center', paddingVertical: 10 }}>Apply Filter</Typography>
        </PressableBox>
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 10,
            paddingBottom: 24
          }}
        >
            <Typography type="h5" style={{ paddingBottom: 8 }}>
                {`${t('Categories')}`}
            </Typography>

            <View style={[wrapper.row, { flexWrap: 'wrap' }]}>
                {CATEGORY.map((item, index) => (
                <Button
                    key={index}
                    containerStyle={{
                    marginBottom: 8,
                    marginRight: 8,
                    borderColor: fields.catsort === item.value ? colors.transparent('#0d674e', 1) : colors.gray[400],
                    }}
                    border
                    onPress={() => handleFieldChangeNew('catsort', item.value)}
                >
                    <Typography
                    style={{
                        color: fields.catsort === item.value ? '#0d674e' : colors.gray[900],
                        fontSize: 12
                    }}
                    >
                    {t(`${''}${item.label}`)}
                    </Typography>
                </Button>
                ))}
            </View>
            {contactLensFilter}
            {NotifDiFilter}
            {PriceDefault}
            {PriceSol}
            {BrandFilter}
            {GenderFilter}
        </ScrollView>
      </BottomDrawer>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingTop: 8,
    paddingBottom: 24,
  },
  sorry: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginTop: 120
  },
  refresh: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginTop: 120,
    marginVertical: 20
  },
  wrapper: {
    backgroundColor: colors.white,
    paddingHorizontal: 25,
  },

  header: {
    marginHorizontal: -15,
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
    borderRadius: 10
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
  brandImage: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
  },
  menuBtnContainer: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    marginBottom: 10,
    borderColor: colors.transparent('palettes.primary', 0.5),
  },
});

export default SearchNew;