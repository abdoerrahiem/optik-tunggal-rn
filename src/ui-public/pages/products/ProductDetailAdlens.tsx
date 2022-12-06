import { RouteProp, useRoute } from '@react-navigation/core';
import React, { useCallback, useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, useWindowDimensions, ToastAndroid, Alert } from 'react-native';
import { View } from 'react-native-animatable';
import { colors, wrapper } from '../../../lib/styles';
import { PublicHomeStackParamList } from '../../../router/publicBottomTabs';
import { useAppNavigation } from '../../../router/RootNavigation';
import { Modelable, ModelablePaginate, ProductModel, BrandModel, ColorModel, GenderModel, BrandCLModel } from '../../../types/model';
import { Badge, BottomDrawer, Button, Header, Typography } from '../../../ui-shared/components';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ProductsLoading from '../../loadings/ProductsLoading';
import ProductsAdlens from '../../components/ProductsAdlens';
import { ValueOf } from '../../../types/utilities';
import { httpService } from '../../../lib/utilities';
import { useAppSelector } from '../../../redux/hooks';
import { useTranslation } from 'react-i18next';
import ViewCollapse from '../../components/ViewCollapse';

const SORT = [
  { label: `${''}Semua harga`, value: '0' },
  { label: `${''}Rp. 0 - 1.300.000`, value: '1' },
  { label: `${''}Rp. 1.300.001 - Rp. 2.000.000`, value: '2' },
  { label: `${''}Rp. 2.000.001 - Rp. 4.000.000`, value: '3' },
  { label: `${''}Rp. 4.000.001 - Rp. 7.000.000`, value: '4' },
  { label: `${''}> Rp. 7.000.001`, value: '5' },
];

const SORTCLSLACS = [
  { label: `${''}Lowest price`, value: 'ASC', icon: 'ios-arrow-down-circle-sharp' },
  { label: `${''}Highest price`, value: 'DESC', icon: 'ios-arrow-up-circle-sharp' },
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

function ProductDetailAdlens() {
  // Hooks
  const navigation = useAppNavigation();
  const route = useRoute<RouteProp<PublicHomeStackParamList, 'ProductDetailAdlens'>>();
  const { width, height } = useWindowDimensions();
  const { categories } = useAppSelector(({ shop }) => shop);
  const { brands } = useAppSelector(({ shop }) => shop);
  const { warnas } = useAppSelector(({ shop }) => shop);
  const { t } = useTranslation('home');

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
  const [brandCL, setBrandCL] = useState<Modelable<BrandCLModel>>({ // CL itu Contact Lens
    models: [],
    modelsLoaded: false,
  });
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
    catsort: '',
  });
  const [options, setOptions] = useState<OptionsState>({
    filterModalOpen: false,
    prdcat: '',
    // prdgender: '',
    brand: '',
    warna: '',
    catsort: ''
  });

  // Effects
  useEffect(() => {
    setProduct(state => ({
      ...state,
      page: 1
    }));
    retrieveBrands(route.params.keywords);
    retrieveGenders();
  }, []);

  useEffect(() => {
    const { search: routeSearch, category: routeCategory, brand: routeBrand } = route.params;
    routeSearch && setSearch(routeSearch);
    if (routeCategory) {
      handleFieldChange('prdcat', routeCategory.id);

      setOptions(state => ({ ...state, prdcat: routeCategory.id }));
    }else if (routeBrand) {
      handleFieldChange('brand', routeBrand.id);

      setOptions(state => ({ ...state, brand: routeBrand.id }));
    }

  }, [route.params]);

  useEffect(() => {
    if (!product.isPageEnd) {
      retrieveProducts(product.page);
    }
  }, [product.page]);

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

  // Vars
  const retrieveProducts = async (page: number = 1) => {
    const reccnt = product.perPage * (page <= 1 ? 0 : page);

    setIsLoading(true);
    setProduct(state => ({ ...state, modelsLoaded: false }));

    return httpService('/api/product/product', {
      data: {
        act: 'PrdListKatalog',
        dt: JSON.stringify({
          reccnt,
          pg: page,
          limit: product.perPage,
          search: null,
          keyword: 'adlens',
          prdid: route.params.product?.prd_id,
          color: null,
          merk: null,
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
      }
    }).catch(err => {
      setIsLoading(false);
      setProduct(state => ({ ...state, modelsLoaded: true }));
    });
  };

  const retrieveColors = async (jenis: String) => {
    return httpService('/api/brand/brand', {
      data: {
        act: 'CategoryBrand',
        dt: JSON.stringify({ jns: jenis }),
      }
    }).then(({ status, data }) => {
      if (200 === status) {
        setWarna(state => ({
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

  const handleFieldChange = (field: keyof Fields, value: ValueOf<Fields>) => {
    // Alert.alert( "Pemberitahuan", "Test : "+value,
    //             [
    //               { text: "GANTI DATA", onPress: () => console.log('test')}
    //             ]
    // );
    setFields(state => ({
      ...state,
      [field]: value
    }));
  };

  const handleFilterApply = async () => {
    handleModalToggle('filter', false);

    // handleFieldChange('prdcat', options.prdcat);
    // handleFieldChange('brand', options.brand);

    setProduct(state => ({
      ...state,
      page: 1,
      models: [],
      modelsLoaded: false,
      isPageEnd: false,
    }));

    product.page === 1 && await retrieveProducts();
  };

  let filterCount = 0;

  fields.sort && filterCount++;
  fields.prdcat && filterCount++;
  fields.brand && filterCount++;
  fields.catsort && filterCount++;

  const filterColor = filterCount ? colors.palettes.primary : colors.gray[700];
  const categoryActive = categories?.find(item => item.id === fields.prdcat);
  const brandActive = brands?.find(item => item.id === fields.brand);
  const priceActive = SORT?.find(item => item.value === fields.sort);

  return (
    <View style={{ flex: 1, backgroundColor: '#FEFEFE' }}>
      <Button
        containerStyle={{
          position: 'absolute',
          marginHorizontal: 10,
          marginVertical: 10,
          backgroundColor: colors.white,
        }}
        size={40}
        rounded={40}
        onPress={() =>
          navigation.navigatePath('Public', {
            screen: 'BottomTabs.HomeStack.Search',
          })
        }
      >
        <Ionicons
          name="arrow-back"
          size={28}
          style={{ marginTop: 2 }}
        />
      </Button>
      <Image source={{ uri: 'https://optiktunggal.com/img/product_brand/PB220902012022-09-02_14_10_51.jpg' }} 
             style={{width: 100, height: 30, marginTop: 15, alignSelf: 'center'}} />
      <Typography size='xs' style={{textAlign: 'justify', paddingHorizontal: 20, paddingVertical: 15}}>
        Adlens adalah Kategori terbaru dari jenis kacamata. Sebelumnya kita mengenal kacamata Single Fokus,Double Fokus dan Progressive. 
        Nah sekarang muncul kategori baru yaitu Variable Focus yaitu adlens dengan produknya Hemisphere & emergensee.
      </Typography>
      <ProductsAdlens
        contentContainerStyle={[styles.container, styles.wrapper, {marginTop: 10,}]}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingTop: 10,
    paddingBottom: 24,
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
  menuBtnContainer: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    marginBottom: 10,
    borderColor: colors.transparent('palettes.primary', 0.5),
  },
});

export default ProductDetailAdlens;