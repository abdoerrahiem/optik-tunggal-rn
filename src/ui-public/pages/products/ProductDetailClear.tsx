import numeral from 'numeral'
import React, { useEffect, useRef, useState } from 'react'
import {
  Alert,
  Image,
  Linking,
  ListRenderItemInfo,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  FlatList,
  ToastAndroid,
} from 'react-native'
import Carousel from 'react-native-snap-carousel'
import { colors, ColorVariant, shadows, wrapper } from '../../../lib/styles'
import {
  CartItemType,
  Modelable,
  ProductModel,
  ProductPhoto,
  ProductRetail,
  ColorModel,
  SpheriesModel,
  BaseCurveModel,
  ReviewModel,
  CartModel,
} from '../../../types/model'
import {
  BadgeDiscount,
  BottomDrawer,
  Button,
  ButtonCart,
  TextField,
  ImageAuto,
  PressableBox,
  ProgressBar,
  RenderHtml,
  Typography,
} from '../../../ui-shared/components'
import { BoxLoading } from '../../../ui-shared/loadings'
import ReviewItem from '../../components/ReviewItem'
import Ionicons from 'react-native-vector-icons/Ionicons'
import ImageView from 'react-native-image-viewing'
import { ImageSource } from 'react-native-vector-icons/Icon'
import { useAppNavigation } from '../../../router/RootNavigation'
import { RouteProp, useNavigation, useRoute } from '@react-navigation/core'
import { PublicHomeStackParamList } from '../../../router/publicBottomTabs'
import { useAppSelector } from '../../../redux/hooks'
import { httpService } from '../../../lib/utilities'
import { useDispatch } from 'react-redux'
import { pushCartItem } from '../../../redux/actions/shopActions'
import { default as _omit } from 'lodash/omit'
import { getConfig } from '../../../lib/config'
import { toggleFavorite } from '../../../redux/actions'
import { useTranslation } from 'react-i18next'
import ProductsSerupa from '../../components/ProductsSerupa'
import ProductsLoading from '../../loadings/ProductsLoading'
import { WebView } from 'react-native-webview'
import { ErrorState, ValueOf } from '../../../types/utilities'
import SelectDropdown from 'react-native-select-dropdown'
import ViewCollapse from '../../components/ViewCollapse';
import {
  formatCurrency,
  getSupportedCurrencies,
} from 'react-native-format-currency'
import { StringMap } from 'i18next'
import { indexOf } from 'lodash'
import DropDownPicker from 'react-native-dropdown-picker'

const QTY = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
const QTY2 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

type Fields = {
  sort?: string
  prdcat?: string
  brand?: string
  spheries?: string
  spheries2?: string
  spheries3?: string
  basecurve?: string
  basecurve2?: string
  basecurve3?: string
  jumlah?: number
  jumlah2?: number
}

type OptionsStateSpheries = {
  sph?: SpheriesModel[]
  sphLoaded?: boolean
  sphModalOpen?: boolean
}

type OptionsStateSpheries2 = {
  sph2?: SpheriesModel[]
  sph2Loaded?: boolean
  sph2ModalOpen?: boolean
}

type OptionsStateSpheries3 = {
  sph3?: SpheriesModel[]
  sph3Loaded?: boolean
  sph3ModalOpen?: boolean
}

type OptionsStateBaseCurve = {
  basecrv?: BaseCurveModel[]
  basecrvLoaded?: boolean
  basecrvModalOpen?: boolean
}

type OptionsStateBaseCurve2 = {
  basecrv2?: BaseCurveModel[]
  basecrv2Loaded?: boolean
  basecrv2ModalOpen?: boolean
}

type OptionsStateBaseCurve3 = {
  basecrv3?: BaseCurveModel[]
  basecrv3Loaded?: boolean
  basecrv3ModalOpen?: boolean
}

function ProductDetailClear() {
  // Hooks
  const navnav = useNavigation()
  const navigation = useAppNavigation()
  const route = useRoute<RouteProp<PublicHomeStackParamList, 'ProductDetailClear'>>()
  const { width, height } = useWindowDimensions()
  const {
    user: { user, favorites },
  } = useAppSelector(state => state)
  const dispatch = useDispatch()
  const { t } = useTranslation('home')
  const carouselRef = useRef<any>()
  const [dropdownValue, setDropdownValue] = useState('- Pilih -')
  const [dropdownValue2, setDropdownValue2] = useState('- Pilih -')
  const [dropdownValueBc, setDropdownValueBc] = useState('- Pilih -')
  const [dropdownValueBc2, setDropdownValueBc2] = useState('- Pilih -')
  const [dropdownValueQty, setDropdownValueQty] = useState(0)
  const [dropdownValueQty2, setDropdownValueQty2] = useState(0)
  const [base_crv, setBase_crv] = useState()
  const [base_crv2, setBase_crv2] = useState()

  // States
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [product, setProduct] = useState<Modelable<ProductModel>>({
    model: null,
    modelsLoaded: false,
  })
  const [getProduct, setGetProduct] = useState<Modelable<ProductModel>>({
    model: null,
    modelsLoaded: false,
  })
  const [review, setReview] = useState<Modelable<ReviewModel>>({
    models: [],
    modelsLoaded: false,
  })
  const [tabActive, setTabActive] = useState<number>(0)
  const [options, setOptions] = useState({
    imageModalOpen: false,
    imageIndex: 0,
  })
  const [pilihanSpheries, setPilihanSpheries] = useState<OptionsStateSpheries>({
    sph: [],
    sphLoaded: false,
    sphModalOpen: false,
  })
  const [pilihanSpheries2, setPilihanSpheries2] = useState<OptionsStateSpheries2>({
    sph2: [],
    sph2Loaded: false,
    sph2ModalOpen: false,
  })
  const [pilihanSpheries3, setPilihanSpheries3] =
    useState<OptionsStateSpheries3>({
      sph3: [],
      sph3Loaded: false,
      sph3ModalOpen: false,
    })
  const [pilihanBaseCrv, setPilihanBaseCrv] = useState<OptionsStateBaseCurve>({
    basecrv: [],
    basecrvLoaded: false,
    basecrvModalOpen: false,
  })
  const [pilihanBaseCrv2, setPilihanBaseCrv2] =
    useState<OptionsStateBaseCurve2>({
      basecrv2: [],
      basecrv2Loaded: false,
      basecrv2ModalOpen: false,
    })
  const [pilihanBaseCrv3, setPilihanBaseCrv3] =
    useState<OptionsStateBaseCurve3>({
      basecrv3: [],
      basecrv3Loaded: false,
      basecrv3ModalOpen: false,
    })

  const [fields, setFields] = useState<Fields>({
    sort: '',
    prdcat: '',
    brand: '',
    spheries: '',
    spheries2: '',
    spheries3: '',
    basecurve: '',
    basecurve2: '',
    basecurve3: '',
    jumlah: 0,
    jumlah2: 0,
  })

  const [error, setError] = useState<ErrorState<Fields>>({
    fields: [],
    message: undefined,
  })

  // Effects
  useEffect(() => {
    retrieveProductsList()
  }, [])

  useEffect(() => {
    const { product_id, product } = route.params
    // Alert.alert( "Pemberitahuan", "Brand : "+type);
    product &&
      setProduct(state => ({
        ...state,
        model: product,
        modelLoaded: false,
      }))
    if (
      route.params.product?.description == 'CL'
    ) {
      retrieveSpheries()
      retrieveBaseCurve()
    }

    handleRefresh()
  }, [route.params])

  useEffect(() => {
    //
  }, [favorites])

  // Vars
  const handleRefresh = async () => {
    const { product_id, product } = route.params
    setIsLoading(true)

    if (
      route.params.product?.description == 'ACCS' ||
      route.params.product?.description == 'CL' ||
      route.params.product?.description == 'SL'
    ) {
      undefined !== product_id && retrieveProduct(product_id)
    } else {
      undefined !== product_id && retrieveProduct(product_id)
    }

    route.params?.product_id
    retrieveSpheries()
    retrieveBaseCurve()

    setDropdownValueBc('- Pilih -')
    setDropdownValueBc2('- Pilih -')
    setDropdownValueQty(0)
    setDropdownValueQty2(0)

    setIsLoading(false)
  }

  // GET SPHERIES API
  const retrieveSpheries = async () => {
    setPilihanSpheries(state => ({
      ...state,
      sph: [],
      sphLoaded: false,
    }))

    setPilihanSpheries2(state => ({
      ...state,
      sph2: [],
      sph2Loaded: false,
    }))

    setPilihanSpheries2(state => ({
      ...state,
      sph2: [],
      sph2Loaded: false,
    }))

    return await httpService('/api/product/product', {
      data: {
        act: 'Spheries',
        dt: JSON.stringify({
          jenis: route.params.product?.description == 'ACCS' ? 'ACCS' : 'CL',
          prdid: route.params.product?.prd_id || route.params.product_id,
        }),
      },
    }).then(({ status, data }) => {
      if (status === 200) {
        setPilihanSpheries(state => ({
          ...state,
          sph: data,
          sphLoaded: true,
        }))

        setPilihanSpheries2(state => ({
          ...state,
          sph2: data,
          sph2Loaded: true,
        }))

        setPilihanSpheries3(state => ({
          ...state,
          sph3: data,
          sph3Loaded: true,
        }))
      }
    })
  }

  // GET BASE CURVE API
  const retrieveBaseCurve = async () => {
    setPilihanBaseCrv(state => ({
      ...state,
      basecrv: [],
      basecrvLoaded: false,
    }))

    return await httpService('/api/product/product', {
      data: {
        act: 'BaseCurve',
        dt: JSON.stringify({
          jenis: route.params.product?.description == 'ACCS' ? 'ACCS' : 'CL',
          prdid: route.params.product?.prd_id || route.params.product_id,
        }),
      },
    }).then(({ status, data }) => {
      if (status === 200) {
        setBase_crv(data[0].id)
        setBase_crv2(data[0].id)
        setPilihanBaseCrv(state => ({
          ...state,
          basecrv: data,
          basecrvLoaded: true,
        }))

        setPilihanBaseCrv2(state => ({
          ...state,
          basecrv2: data,
          basecrv2Loaded: true,
        }))

        setPilihanBaseCrv3(state => ({
          ...state,
          basecrv3: data,
          basecrv3Loaded: true,
        }))
      }
    })
  }

  const retrieveProductsList = async (page: number = 1) => {
    const reccnt = 10 * (page <= 1 ? 0 : page)

    setIsLoading(true)
    setProduct(state => ({ ...state, modelsLoaded: false }))

    return httpService('/api/product/product', {
      data: {
        act: 'PrdSerupa',
        dt: JSON.stringify({
          reccnt,
          pg: page,
          param: 'serupa',
          limit: 10,
          brand: route.params.product?.merk || productModel.merk,
          prdid: route.params.product?.prd_id || route.params.product_id,
          prdcat: '',
          search: null,
        }),
      },
    })
      .then(({ status, data }) => {
        if (status === 200) {
          setProduct(state => ({
            ...state,
            models: [...(state.models || []), ...data],
            modelsLoaded: true,
            isPageEnd: !data?.length,
          }))
        }
      })
      .catch(err => {
        setProduct(state => ({ ...state, modelsLoaded: true }))
      })
  }

  const retrieveProduct = async (product_id: string) => {
    return httpService('/api/product/product/', {
      data: {
        dt: JSON.stringify({
          prd_id: product_id,
          flaq: route.params.deskripsi || route.params.product?.description,
        }),
        act: 'PrdInfo',
      },
    }).then(({ status, data: [data], foto }) => {
      if (status === 200) {
        setProduct(state => ({
          ...state,
          model: {
            ...data,
            images: foto,
          },
          modelLoaded: true,
        }))
        if (
          route.params.product?.description == 'ACCS' ||
          route.params.product?.description == 'CL' ||
          route.params.product?.description == 'SL'
        ) {
          null
        } else {
          retrieveReviews(product_id)
        }
      }
    })
  }

  const retrieveReviews = async (product_id: string) => {
    return httpService('/api/review/review/', {
      data: {
        act: 'UlasanList',
        dt: JSON.stringify({ comp: '001', idprd: product_id, limit: 2 }),
      },
    })
      .then(({ status, data }) => {
        if (status === 200) {
          setReview(state => ({
            ...state,
            models: data,
            modelsLoaded: true,
          }))
        }
      })
      .catch(() => void 0)
  }

  const handleModalToggle = (type: string, open: boolean | null = null) => {
    switch (type) {
      case 'image':
        setOptions(state => ({
          ...state,
          imageModalOpen:
            typeof open === 'boolean' ? open : !options.imageModalOpen,
        }))
        break
    }
  }

  const handleFieldChange = (field: keyof Fields, value: ValueOf<Fields>) => {
    const { fields = [] } = error
    setFields(state => ({
      ...state,
      [field]: value,
    }))

    fields.indexOf(field) >= 0 &&
      setError({
        fields: [],
        message: undefined,
      })

    // handleCloseModal(field, false);
  }

  const handleFavoriteToggle = async () => {
    if (!user) {
      return navigation.navigatePath('Public', {
        screen: 'BottomTabs.AccountStack.Account',
      })
    }

    return !product.model ? void 0 : dispatch(toggleFavorite(product.model))
  }

  const renderCarousel = ({ item, index }: ListRenderItemInfo<ImageSource>) => {
    const height = width

    return (
      <PressableBox
        key={index}
        containerStyle={styles.carouselItem}
        style={{ paddingHorizontal: 0 }}
        opacity={1}
        onPress={() => {
          setOptions(state => ({
            ...state,
            imageModalOpen: true,
            imageIndex: index,
          }))
        }}
      >
        <Image source={item} style={[styles.carouselImage, { height }]} />
      </PressableBox>
    )
  }

  const _isSpheries = pilihanSpheries.sph?.find(
    item => item.ket === fields.spheries
  )
  
  const _isBCurve = pilihanBaseCrv.basecrv?.find(
    item => item.code === fields.basecurve
  )
  const _isBCurve2 = pilihanBaseCrv2.basecrv2?.find(
    item => item.code === fields.basecurve2
  )

  const handleCartAddClear = async (tipe: string) => {
    const cekBaseCurve = pilihanBaseCrv.basecrv?.length === 1 ? true : false
    const cekBaseCurve2 = pilihanBaseCrv2.basecrv2?.length === 1 ? true : false

    console.log('ISINYA : ', cekBaseCurve, cekBaseCurve2)
    if (tipe == 'contactlensclear') {
      if(productModel.package === 1){
        if(fields.spheries != "" && fields.spheries2 != ""){
          /*if(cekBaseCurve === false || cekBaseCurve2 === false){
            ToastAndroid.show(`${''}Pilihan belum lengkap!`, ToastAndroid.LONG)
          }else */if(fields.jumlah === 0 || fields.jumlah2 === 0){
            ToastAndroid.show(`${''}Pilihan belum lengkap!`, ToastAndroid.LONG)
          }else if(cekBaseCurve == true || fields.spheries != "" || fields.jumlah == 0 ||
                   cekBaseCurve2 == true || fields.spheries2 != "" || fields.jumlah2 == 0){
            toCartLens(fields.spheries2)
          }else{
            toCartLens(fields.spheries2)
          }
        }else if(fields.spheries != ""){
          /*if(cekBaseCurve == false){
            ToastAndroid.show(`${''}Pilihan mata kiri belum dipilih!`, ToastAndroid.LONG)
          }else */if(fields.jumlah === 0){
            ToastAndroid.show(`${''}Pilihan mata kiri belum dipilih!`, ToastAndroid.LONG)
          }else if(cekBaseCurve == true || fields.spheries != "" || fields.jumlah == 0){
            toCartLens(fields.spheries2)
          }else{
            toCartLens(fields.spheries2)
          }
        }else if(fields.spheries2 != ""){
          /*if(cekBaseCurve == false){
            ToastAndroid.show(`${''}Pilihan mata kanan belum dipilih!`, ToastAndroid.LONG)
          }else */if(fields.jumlah2 === 0){
            ToastAndroid.show(`${''}Pilihan mata kanan belum dipilih!`, ToastAndroid.LONG)
          }else if(cekBaseCurve2 == true || fields.spheries2 != "" || fields.jumlah2 == 0){
            toCartLens(fields.spheries2)
          }else{
            toCartLens(fields.spheries2)
          }
        }else if(fields.spheries == "" && fields.spheries2 == "" &&
                 fields.basecurve == "" && fields.basecurve2 == "" && fields.jumlah == 0 && fields.jumlah2 == 0){
          ToastAndroid.show(`${''}Silahkan lengkapi salah satu atau kedua pilihan!`, ToastAndroid.LONG)
        }
      }else{
        if(fields.spheries != "" && fields.spheries2 != ""){
          /*if(cekBaseCurve === false || cekBaseCurve2 === false){
            ToastAndroid.show(`${''}Pilihan belum lengkap!`, ToastAndroid.LONG)
          }else */if(cekBaseCurve == true || fields.spheries != "" ||
                   cekBaseCurve2 == true || fields.spheries2 != ""){
            toCartLens(fields.spheries2)
          }else{
            toCartLens(fields.spheries2)
          }
        }else if(fields.spheries != ""){
          /*if(cekBaseCurve == false){
            ToastAndroid.show(`${''}Pilihan belum dipilih!`, ToastAndroid.LONG)
          }else */if(cekBaseCurve == true || fields.spheries != ""){
            toCartLens(fields.spheries2)
          }else{
            toCartLens(fields.spheries2)
          }
        }else if(fields.spheries2 != ""){
          /*if(cekBaseCurve == false){
            ToastAndroid.show(`${''}Pilihan belum dipilih!`, ToastAndroid.LONG)
          }else */if(cekBaseCurve2 == true || fields.spheries2 != ""){
            toCartLens(fields.spheries2)
          }else{
            toCartLens(fields.spheries2)
          }
        }else if(fields.spheries == "" && fields.spheries2 == "" &&
                 fields.basecurve == "" && fields.basecurve2 == ""){
          ToastAndroid.show(`${''}Silahkan lengkapi salah satu atau kedua pilihan!`, ToastAndroid.LONG)
        }
      }
    }
  }

  const isDiffLens = (): boolean => {
    if (
      fields.basecurve !== fields.basecurve2 ||
      fields.spheries !== fields.spheries2
    ) {
      return true
    }

    return false
  }

  let randomNumber = Math.floor(Math.random() * 100) + 1;
  let bcurve = pilihanBaseCrv.basecrv?.length === 1 ? base_crv : fields.basecurve
  let bcurve2 = pilihanBaseCrv2.basecrv2?.length === 1 ? base_crv2 : fields.basecurve2
  
  const toCartLens = async (spheries2: string) => {
    console.log(fields)
    const _isSpheries2 = pilihanSpheries2.sph2?.find(
      item => item.ket === spheries2
    )
    const payload = [
      {
        cartid: randomNumber, 
        product: _omit(product.model || undefined, 'product_info'),
        pid: product.model?.prd_id+bcurve+'0M'+_isSpheries?.kd_sph+'0000',
        atributColor: "0",
        atributSpheries: fields.spheries,
        atributBcurve: bcurve,
        paket: productModel.package,
        hargapaket: productModel.package === 1 && fields.spheries != '' ? productModel.harga : (
          productModel.package > 1 && fields.spheries != '' && fields.spheries2 != '' ? Number(productModel.harga)/2 : 
          productModel.package > 1 && fields.spheries != '' || fields.spheries2 == '' ? Number(productModel.harga) : Number(productModel.harga)
        ),
        qty: productModel.package === 1 && fields.spheries != '' ? fields.jumlah : (
          productModel.package > 1 && fields.spheries != '' && fields.spheries2 != '' ? Number(productModel.package)/2 : 
          productModel.package > 1 && fields.spheries != '' || fields.spheries2 === '' ? Number(productModel.package) : fields.jumlah
        ),
        diff: isDiffLens(),
      },
      {
        cartid: randomNumber,
        product: _omit(product.model || undefined, 'product_info'),
        pid: product.model?.prd_id+bcurve2+'0M'+_isSpheries2?.kd_sph+'0000',
        atributColor: "0",
        atributSpheries: fields.spheries2,
        atributBcurve: bcurve2,
        paket: productModel.package,
        hargapaket: productModel.package === 1 && fields.spheries2 != '' ? productModel.harga : (
          productModel.package > 1 && fields.spheries != '' && fields.spheries2 != '' ? Number(productModel.harga)/2 : 
          productModel.package > 1 && fields.spheries === '' || fields.spheries2 != '' ? Number(productModel.harga) : Number(productModel.harga)
        ),
        qty: productModel.package === 1 && fields.spheries2 != '' ? fields.jumlah2 : (
          productModel.package > 1 && fields.spheries != '' && fields.spheries2 != '' ? Number(productModel.package)/2 : 
          productModel.package > 1 && fields.spheries === '' && fields.spheries2 != '' ? Number(productModel.package) : fields.jumlah2
        ),
        diff: isDiffLens(),
      },
    ].filter(filterItem => filterItem.qty !== undefined && filterItem.qty !== 0)

    dispatch(pushCartItem(payload))

    navigation.navigatePath('Public', {
      screen: 'BottomTabs.CartStack.Cart',
    })
  }

  const { ...productModel } = product.model || {}
  // const productImages: ImageSource[] = [productModel.prd_foto, ...(productModel.images || [])]
  const productImages: ImageSource[] = [...(productModel.images || [])]
    .filter(item => typeof item === 'string' || item?.prd_foto)
    .map(item => ({
      uri: typeof item === 'string' ? item : item?.prd_foto,
    }))

  // let canAddToCart = false;

  const favorite = favorites.find(item => item.prd_id === product.model?.prd_id)
  // let retails: ProductRetail[] = [];
  const textPilih = t(`${''}Select`)

  const renderElement = () => {
    if (route.params.product?.description == 'CL') {
      return (
        <View style={{ flex: 1, marginTop: 30 }}>
          <Button
            containerStyle={{
              overflow: 'visible',
              borderRadius: 5,
              borderWidth: 1,
              borderColor: '#0d674e',
              backgroundColor: '#0d674e',
              marginTop: 10,
              height: 50,
              flex: 1,
            }}
            opacity={1}
            onPress={
              () => handleCartAddClear('contactlensclear')
              // Alert.alert( "Pemberitahuan", "Mohon maaf, fitur ini sedang proses pengembangan.")
            }
          >
            <Typography
              style={{
                color: '#FEFEFE',
                textAlign: 'center',
                paddingVertical: 7,
                fontSize: 12,
              }}
            >
              Masukkan Keranjang
            </Typography>
          </Button>
        </View>
      )
    } 
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={handleRefresh}
          colors={[colors.palettes.primary]}
        />
      }
    >
      {!product.modelLoaded ? (
        <View>
          <BoxLoading
            width={width}
            height={width}
            style={{ marginHorizontal: -15 }}
          />
          <BoxLoading
            width={[200, 240]}
            height={20}
            style={{ marginTop: 15 }}
          />
          <BoxLoading
            width={width - 30}
            height={16}
            style={{ marginTop: 15 }}
          />
          <BoxLoading width={width - 30} height={16} style={{ marginTop: 2 }} />
          <BoxLoading width={180} height={16} style={{ marginTop: 2 }} />
        </View>
      ) : (
        <View>
          {!productModel.images?.length ? null : (
            <View style={{ marginHorizontal: -15, position: 'relative' }}>
              <Carousel
                ref={carouselRef}
                data={productImages as any[]}
                renderItem={renderCarousel}
                sliderWidth={width}
                itemWidth={width}
                inactiveSlideScale={1}
              />
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

              <Button
                containerStyle={{
                  position: 'absolute',
                  top: 15,
                  right: 15,
                  backgroundColor: colors.white,
                  elevation: 2,
                }}
                size={40}
                rounded={40}
                onPress={handleFavoriteToggle}
              >
                <Ionicons
                  name={!favorite ? 'heart-outline' : 'heart'}
                  size={28}
                  color={!favorite ? colors.gray[600] : colors.palettes.red}
                  style={{ marginTop: 2 }}
                />
              </Button>

              <Typography size='xs' style={styles.totalImages}>
                {productModel.images.length} Images
              </Typography>
              <ScrollView horizontal={true} style={{ marginHorizontal: 15 }}>
                {productImages.map((item, index) => (
                  <PressableBox
                    key={index}
                    containerStyle={{ marginVertical: 10 }}
                    style={{
                      marginHorizontal: 3,
                    }}
                    opacity={1}
                    onPress={() => {
                      setOptions(state => ({
                        ...state,
                        imageModalOpen: true,
                        imageIndex: index,
                      }))
                    }}
                  >
                    <View
                      style={{
                        borderColor: '#ccc',
                        borderWidth: 1,
                        borderRadius: 5,
                        paddingHorizontal: 3,
                        paddingVertical: 3,
                      }}
                    >
                      <Image
                        source={item}
                        style={{
                          width: 60,
                          height: 50,
                          paddingVertical: 10,
                          resizeMode: 'stretch',
                        }}
                      />
                    </View>
                  </PressableBox>
                ))}
              </ScrollView>
            </View>
          )}
          <View style={{ paddingTop: -20, paddingHorizontal: 5 }}>
            <Typography type="h5" style={{ color: '#333333' }}>
              {productModel.prd_ds}
            </Typography>
            {productModel.harga_promo == 0 ? (
              <>
                <Typography color="#0d674e">
                  {formatCurrency({
                    amount: productModel.harga,
                    code: 'IDR',
                  })}
                </Typography>
              </>
            ) : (
              <>
                <Typography
                  type="h4"
                  color="red"
                  style={{ textDecorationLine: 'line-through' }}
                >
                  {formatCurrency({
                    amount: productModel.harga,
                    code: 'IDR',
                  })}
                </Typography>
                <Typography type="h4" color="#0d674e">
                  {formatCurrency({
                    amount: productModel.harga_promo,
                    code: 'IDR',
                  })}
                </Typography>
              </>
            )}
            <View
              style={{
                height: 1,
                backgroundColor: '#ccc',
                marginVertical: 15,
              }}
            />
            <View style={{marginBottom: 20}}>
              {route.params.product.detailproduk == null ? null :
              (
                <>
                  <ViewCollapse
                    style={styles.menuContainer}
                    pressableProps={{
                      containerStyle: styles.menuBtnContainer,
                    }}
                    header={t(`${''}Deskripsi Produk`)}
                    headerProps={{
                      type: 'p',
                      style: {fontSize: 12}
                    }}
                  >
                    <PressableBox
                        containerStyle={{
                          marginTop: 8,
                          borderRadius: 5,
                          marginHorizontal: 0,
                        }}
                        style={styles.menuChildBtn}
                      >
                        <View style={{flex: 1, marginVertical: 5, marginHorizontal: -8 }}>
                          <Typography style={{textAlign: 'justify', fontSize: 11}}>
                            {route.params.product.detailproduk}
                          </Typography>
                        </View>
                      </PressableBox>
                  </ViewCollapse>
                </>
              )}
            </View>
            {route.params.product.qty === 0 ? (
              <View style={{backgroundColor: 'transparent', marginTop: 30}}>
                <Button
                  containerStyle={{ alignSelf: 'center', marginBottom: 10, backgroundColor: '#666', width: 320 }}
                  onPress={() => Linking.openURL('https://wa.me/6281113203000?text=Halo,%20Untuk%20produk%20ini%20'+productModel.prd_ds+'%20(%20'+productModel.prd_id+'%20)%20apakah%20%20tersedia?')}  
                >
                  <Typography size='xs' style={{ color: '#fff', paddingVertical: 5 }}>Stok terbatas, Hubungi Kami</Typography>
                </Button>
              </View>
            ) : (
            <View>
              <View style={[wrapper.row]}>
                <View style={{ flex: 0.7 }} />
                <View style={{ flex: 1 }}>
                  <Typography
                    style={[styles.fontnya, { fontWeight: 'bold' }]}
                  >
                    Mata Kiri (L)
                  </Typography>
                </View>
                <View style={{ flex: 1 }}>
                  <Typography
                    style={[
                      styles.fontnya,
                      { marginLeft: 5, fontWeight: 'bold' },
                    ]}
                  >
                    Mata Kanan (R)
                  </Typography>
                </View>
              </View>
              <View style={[wrapper.row, { marginTop: 5 }]}>
                <View style={{ flex: 0.5 }}>
                  <Typography style={styles.fontnya}>
                    Power
                  </Typography>
                </View>
                <View style={{ flex: 1, alignItems: 'center' }}>
                  <SelectDropdown
                    data={pilihanSpheries.sph?.map(item => {
                      return item.ket
                    })}
                    onSelect={(selectedItem, index) => {
                      handleFieldChange('spheries', selectedItem)
                    }}
                    buttonTextAfterSelection={(selectedItem, index) => {
                      return selectedItem
                    }}
                    rowTextForSelection={(item, index) => {
                      return item
                    }}
                    defaultValue={dropdownValue}
                    defaultButtonText={dropdownValue}
                    buttonStyle={styles.dropdown1BtnStyle}
                    buttonTextStyle={styles.dropdown1BtnTxtStyle}
                    renderDropdownIcon={isOpened => {
                      return (
                        <Ionicons
                          name={isOpened ? 'chevron-up' : 'chevron-down'}
                          size={12}
                          color={'#ccc'}
                        />
                      )
                    }}
                    dropdownIconPosition={'right'}
                    dropdownStyle={styles.dropdown1DropdownStyle}
                    rowStyle={styles.dropdown1RowStyle}
                    rowTextStyle={styles.dropdown1RowTxtStyle}
                  />
                </View>
                <View style={{ flex: 1, alignItems: 'center' }}>
                  <SelectDropdown
                    data={pilihanSpheries2.sph2?.map(item => {
                      return item.ket
                    })}
                    onSelect={(selectedItem, index) => {
                      handleFieldChange('spheries2', selectedItem)
                    }}
                    buttonTextAfterSelection={(selectedItem, index) => {
                      return selectedItem
                    }}
                    rowTextForSelection={(item, index) => {
                      return item
                    }}
                    defaultValue={dropdownValue2}
                    defaultButtonText={dropdownValue2}
                    buttonStyle={styles.dropdown1BtnStyle}
                    buttonTextStyle={styles.dropdown1BtnTxtStyle}
                    renderDropdownIcon={isOpened => {
                      return (
                        <Ionicons
                          name={isOpened ? 'chevron-up' : 'chevron-down'}
                          size={12}
                          color={'#ccc'}
                        />
                      )
                    }}
                    dropdownIconPosition={'right'}
                    dropdownStyle={styles.dropdown1DropdownStyle}
                    rowStyle={styles.dropdown1RowStyle}
                    rowTextStyle={styles.dropdown1RowTxtStyle}
                  />
                </View>
              </View>
              <View style={[wrapper.row, { marginTop: 5 }]}>
                <View style={{ flex: 0.5 }}>
                  <Typography style={styles.fontnya}>Base Curve</Typography>
                </View>
                <View style={{ flex: 1, alignItems: 'center' }}>
                  {pilihanBaseCrv.basecrv?.length === 1 ? (
                    <Typography size='sm' style={{paddingVertical: 10}}>
                      {pilihanBaseCrv.basecrv.map(item => {return item.id})}
                    </Typography>
                  ):(
                    <SelectDropdown
                      data={pilihanBaseCrv.basecrv?.map(item => {
                        return item.id
                      })}
                      onSelect={(selectedItem, index) => {
                        handleFieldChange('basecurve', selectedItem)
                      }}
                      buttonTextAfterSelection={(selectedItem, index) => {
                        return selectedItem
                      }}
                      rowTextForSelection={(item, index) => {
                        return item
                      }}
                      defaultValue={dropdownValueBc}
                      defaultButtonText={dropdownValueBc}
                      buttonStyle={styles.dropdown1BtnStyle}
                      buttonTextStyle={styles.dropdown1BtnTxtStyle}
                      renderDropdownIcon={isOpened => {
                        return (
                          <Ionicons
                            name={isOpened ? 'chevron-up' : 'chevron-down'}
                            size={12}
                            color={'#ccc'}
                          />
                        )
                      }}
                      dropdownIconPosition={'right'}
                      dropdownStyle={styles.dropdown1DropdownStyle}
                      rowStyle={styles.dropdown1RowStyle}
                      rowTextStyle={styles.dropdown1RowTxtStyle}
                    />
                  )}
                </View>
                <View style={{ flex: 1, alignItems: 'center' }}>
                  {pilihanBaseCrv2.basecrv2?.length === 1 ? (
                    <Typography size='sm' style={{paddingVertical: 10}}>
                      {pilihanBaseCrv2.basecrv2.map(item => {return item.id})}
                    </Typography>
                  ):(
                    <SelectDropdown
                      data={pilihanBaseCrv2.basecrv2?.map(item => {
                        return item.id
                      })}
                      onSelect={(selectedItem, index) => {
                        handleFieldChange('basecurve2', selectedItem)
                      }}
                      buttonTextAfterSelection={(selectedItem, index) => {
                        return selectedItem
                      }}
                      rowTextForSelection={(item, index) => {
                        return item
                      }}
                      defaultValue={dropdownValueBc2}
                      defaultButtonText={dropdownValueBc2}
                      buttonStyle={styles.dropdown1BtnStyle}
                      buttonTextStyle={styles.dropdown1BtnTxtStyle}
                      renderDropdownIcon={isOpened => {
                        return (
                          <Ionicons
                            name={isOpened ? 'chevron-up' : 'chevron-down'}
                            size={12}
                            color={'#ccc'}
                          />
                        )
                      }}
                      dropdownIconPosition={'right'}
                      dropdownStyle={styles.dropdown1DropdownStyle}
                      rowStyle={styles.dropdown1RowStyle}
                      rowTextStyle={styles.dropdown1RowTxtStyle}
                    />
                  )}
                </View>
              </View>
              {productModel.package > 1 ? null : 
                (
                  <View style={[wrapper.row, { marginTop: 5 }]}>
                    <View style={{ flex: 0.5 }}>
                      <Typography style={styles.fontnya}>QTY</Typography>
                    </View>
                    <View style={{ flex: 1, alignItems: 'center' }}>
                      <SelectDropdown
                        data={QTY}
                        onSelect={(selectedItem, index) => {
                          handleFieldChange('jumlah', selectedItem)
                        }}
                        buttonTextAfterSelection={(selectedItem, index) => {
                          return selectedItem
                        }}
                        rowTextForSelection={(item, index) => {
                          return item
                        }}
                        defaultValue={dropdownValueQty}
                        defaultButtonText={dropdownValueQty.toString()}
                        buttonStyle={styles.dropdown1BtnStyle}
                        buttonTextStyle={styles.dropdown1BtnTxtStyle}
                        renderDropdownIcon={isOpened => {
                          return (
                            <Ionicons
                              name={isOpened ? 'chevron-up' : 'chevron-down'}
                              size={12}
                              color={'#ccc'}
                            />
                          )
                        }}
                        dropdownIconPosition={'right'}
                        dropdownStyle={styles.dropdown1DropdownStyle}
                        rowStyle={styles.dropdown1RowStyle}
                        rowTextStyle={styles.dropdown1RowTxtStyle}
                      />
                    </View>
                    <View style={{ flex: 1, alignItems: 'center' }}>
                      <SelectDropdown
                        data={QTY2}
                        onSelect={(selectedItem, index) => {
                          handleFieldChange('jumlah2', selectedItem)
                        }}
                        buttonTextAfterSelection={(selectedItem, index) => {
                          return selectedItem
                        }}
                        rowTextForSelection={(item, index) => {
                          return item
                        }}
                        defaultValue={dropdownValueQty2}
                        defaultButtonText={dropdownValueQty2.toString()}
                        buttonStyle={styles.dropdown1BtnStyle}
                        buttonTextStyle={styles.dropdown1BtnTxtStyle}
                        renderDropdownIcon={isOpened => {
                          return (
                            <Ionicons
                              name={isOpened ? 'chevron-up' : 'chevron-down'}
                              size={12}
                              color={'#ccc'}
                            />
                          )
                        }}
                        dropdownIconPosition={'right'}
                        dropdownStyle={styles.dropdown1DropdownStyle}
                        rowStyle={styles.dropdown1RowStyle}
                        rowTextStyle={styles.dropdown1RowTxtStyle}
                      />
                    </View>
                  </View>
                )
              }
              <View style={[wrapper.row, { marginTop: 5 }]}>
                <View style={{ flex: 0.5 }}>
                  <Typography style={styles.fontnya}>Diameter</Typography>
                </View>
                <View style={{ flex: 1, alignItems: 'center' }}>
                <Typography size='sm' style={{paddingVertical: 10}}>{productModel.diameter}</Typography>
                </View>
                <View style={{ flex: 1, alignItems: 'center' }}>
                  <Typography size='sm' style={{paddingVertical: 10}}>{productModel.diameter}</Typography>
                </View>
              </View>
              {renderElement()}
            </View>
            )}
          </View>
        </View>
      )}

      {/* Image Popup */}
      <ImageView
        visible={options.imageModalOpen}
        images={productImages}
        imageIndex={options.imageIndex}
        keyExtractor={(imageSrc: ImageSource, index: number) =>
          `image_view_${index}`
        }
        onRequestClose={() => handleModalToggle('image', false)}
        swipeToCloseEnabled={false}
      />
    </ScrollView>
  )
}

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
    paddingBottom: 24,
  },
  sorry: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginTop: 80,
  },
  wrapper: {
    backgroundColor: colors.white,
    paddingHorizontal: 15,
  },
  borderTop: {
    marginVertical: 8,
    borderTopWidth: 1,
    borderColor: '#c1c1c1',
  },

  carouselItem: {
    overflow: 'hidden',
    width: '100%',
    marginHorizontal: 0,
    borderRadius: 0,
  },
  carouselImage: {
    width: '100%',
    resizeMode: 'contain',
  },

  productTabs: {
    ...wrapper.row,
    marginVertical: 12,
    marginHorizontal: -4,
    paddingHorizontal: 5,
  },
  badgeDiscount: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: '100%',
    backgroundColor: '#f44336',
  },
  brandImage: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },
  totalImages: {
    position: 'absolute',
    top: 295,
    left: 15,
    backgroundColor: '#ededed',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 10,
  },
  fontnya: {
    textAlignVertical: 'center',
    paddingTop: 10,
    color: '#686868',
    fontSize: 10,
  },
  dropdown1BtnStyle: {
    width: '85%',
    height: 40,
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  dropdown1BtnStyleNew: {
    width: '100%',
    height: 40,
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  menuContainer: {
    margin: -15,
    padding: 15,
  },
  menuBtnContainer: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderColor: '#0d674e',
  },
  menuChildBtn: {
    ...wrapper.row,
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 15,
  },
  menuChildIcon: {
    width: 24,
    alignItems: 'center',
  },
  imageFlat: {
    width: 150,
    height: 150,
  },
  dropdown2BtnStyle: {
    width: '100%',
    height: 40,
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  dropdown1BtnTxtStyle: { color: '#444', textAlign: 'left', fontSize: 11 },
  dropdown1DropdownStyle: { backgroundColor: '#EFEFEF' },
  dropdown1RowStyle: {
    backgroundColor: '#EFEFEF',
    borderBottomColor: '#C5C5C5',
  },
  dropdown1RowTxtStyle: { color: '#444', textAlign: 'left' },
})

export default ProductDetailClear