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
  color?: string
  color2?: string
  color3?: string
  spheries?: string
  spheries2?: string
  spheries3?: string
  basecurve?: string
  basecurve2?: string
  basecurve3?: string
  jumlah?: number
  jumlah2?: number
}

function ProductDetail_Adlens() {
  // Hooks
  const navnav = useNavigation()
  const navigation = useAppNavigation()
  const route = useRoute<RouteProp<PublicHomeStackParamList, 'ProductDetail'>>()
  const { width, height } = useWindowDimensions()
  const {
    user: { user, favorites },
  } = useAppSelector(state => state)
  const dispatch = useDispatch()
  const { t } = useTranslation('home')
  const carouselRef = useRef<any>()

  // States
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [product, setProduct] = useState<Modelable<ProductModel>>({
    model: null,
    modelsLoaded: false,
  })
  const [options, setOptions] = useState({
    imageModalOpen: false,
    imageIndex: 0,
  })

  const [fields, setFields] = useState<Fields>({
    sort: '',
    prdcat: '',
    brand: '',
    color: '',
    color2: '',
    color3: '',
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
  
  useEffect(() => {
    const { product_id, product } = route.params
    // Alert.alert( "Pemberitahuan", "Brand : "+type);
    product &&
      setProduct(state => ({
        ...state,
        model: product,
        modelLoaded: false,
      }))
    handleRefresh()
  }, [route.params])

  useEffect(() => {
    //
  }, [favorites])

  // Vars
  const handleRefresh = async () => {
    setIsLoading(true)
    const { product_id, product } = route.params
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
    setIsLoading(false)
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
      }
    })
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

  let randomNumber = Math.floor(Math.random() * 100) + 1;

  const toCartAccessories = async () => {
    dispatch(
      pushCartItem([
        {
          cartid: randomNumber,
          harga: route.params.product?.harga,
          product: _omit(route.params.product || undefined, 'product_info'),
          atributColor3: '',
          atributSpheries3: '',
          atributBcurve3: '',
          qty: 1,
        },
      ])
    )

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
              <View style={{marginHorizontal: 20}}>
                <Typography type="h6" style={{ color: '#333333' }}>
                    {route.params.product?.prd_ds}
                </Typography>
                <Typography style={{ color: '#333333', fontSize: 14 }}>
                  {route.params.product?.prd_id}
                </Typography>

                {route.params.product?.harga_promo == 0 ? (
                  <>
                    <Typography color="#0d674e">
                      {formatCurrency({
                        amount: route.params.product?.harga,
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
                        amount: route.params.product?.harga,
                        code: 'IDR',
                      })}
                    </Typography>
                    <Typography type="h4" color="#0d674e">
                      {formatCurrency({
                        amount: route.params.product?.harga_promo,
                        code: 'IDR',
                      })}
                    </Typography>
                  </>
                )}
              </View>
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
            </View>
          )}
          {productModel.qty === 0 ? (
            <View style={{backgroundColor: 'transparent', marginTop: 30}}>
              <Button
                containerStyle={{ alignSelf: 'center', marginBottom: 10, backgroundColor: '#666', width: 320 }}
                onPress={() => Linking.openURL('https://wa.me/6281113203000?text=Halo,%20Untuk%20produk%20ini%20'+route.params.product?.prd_ds+'%20(%20'+route.params.product?.prd_id+'%20)%20apakah%20%20tersedia?')}  
              >
                <Typography size='xs' style={{ color: '#fff', paddingVertical: 5 }}>Stok terbatas, Hubungi Kami</Typography>
              </Button>
            </View>
          ) : 
          (
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
                  () => toCartAccessories()
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

export default ProductDetail_Adlens