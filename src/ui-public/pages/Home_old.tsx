import React, { useEffect, useRef, useState } from 'react';
import { FlatList, Image, ListRenderItemInfo, StyleSheet, useWindowDimensions, View, Alert } from 'react-native';
import { colors, shadows, wrapper } from '../../lib/styles';
import { CarouselDots, PressableBox, Typography, Button, ButtonCart } from '../../ui-shared/components';
import Carousel from 'react-native-snap-carousel';
import { BoxLoading } from '../../ui-shared/loadings';
import { BannerModel, CategoryModel, Modelable, ModelablePaginate, ProductModel, BrandModel } from '../../types/model';
import { useAppNavigation } from '../../router/RootNavigation';
import Products from '../components/Products';
import ProductsLoading from '../loadings/ProductsLoading';
import { httpService } from '../../lib/utilities';
import { useTranslation } from 'react-i18next';
import { fetchCategories, fetchBrand } from '../../redux/actions/shopActions';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import PopupPromoModal from '../components/PopupPromoModal';
import moment from 'moment';
import { Text } from 'react-native-animatable';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Home = () => {
  // Hooks
  const navigation = useAppNavigation();
  const { width } = useWindowDimensions();
  const { t } = useTranslation('home');
  const dispatch = useAppDispatch();
  const { categories } = useAppSelector(({ shop }) => shop);
  const { brands } = useAppSelector(({ shop }) => shop);

  // Refs
  const carouselRef = useRef<any>();

  // States
  type SliderState = Modelable<BannerModel> & { activeIndex: number; };
  const [slider, setSlider] = useState<SliderState>({
    models: [],
    modelsLoaded: false,
    activeIndex: 0,
  });
  const [category, setCategory] = useState<Modelable<CategoryModel>>({
    models: [],
    modelsLoaded: false,
  });
  const [brand, setBrand] = useState<Modelable<BrandModel>>({
    models: [],
    modelsLoaded: false,
  });
  const [product, setProduct] = useState<ModelablePaginate<ProductModel>>({
    models: [],
    modelsLoaded: false,
    page: 1,
    perPage: 12,
    isPageEnd: false,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [options, setOptions] = useState({
    popupModalOpen: false,
    popupModels: [],
  });

  // Effects
  useEffect(() => {
    handleRefresh();
    navigation.setOptions({
      headerRight: () => (
        <ButtonCart />
      ),
    });
  }, []);

  useEffect(() => {
    if (!product.isPageEnd) {
      retrieveProducts(product.page);
    }
  }, [product.page]);

  // Vars
  const handleRefresh = async () => {
    setIsRefreshing(true);

    retrieveHomepage();

    dispatch(fetchCategories()).unwrap().then((results) => {
      setCategory(state => ({
        ...state,
        models: results,
        modelsLoaded: true
      }));
    }).catch(() => {
      setCategory(state => ({ ...state, modelsLoaded: true }));
    });

    dispatch(fetchBrand()).unwrap().then((results) => {
      setBrand(state => ({
        ...state,
        models: results,
        modelsLoaded: true
      }));
    }).catch(() => {
      setBrand(state => ({ ...state, modelsLoaded: true }));
    });

    //await retrievePopups();

    setIsRefreshing(false);
  };

  const retrieveHomepage = async () => {
    return httpService('/api/home', {
      data: {
        act: 'BannerList',
        dt: JSON.stringify({ comp: '001' }),
      }
    }).then(({ status, data }) => {
      if (200 === status) {
        setSlider(state => ({
          ...state,
          models: data,
          modelsLoaded: true
        }));
      }
    });
  };

  const retrieveProducts = async (page: number = 1) => {
    const reccnt = product.perPage * (page <= 1 ? 0 : page);

    setProduct(state => ({ ...state, modelsLoaded: false }));

    return httpService('/api/product/product', {
      data: {
        act: 'PrdList',
        dt: JSON.stringify({
          comp: '001',
          reccnt,
          pg: page,
          limit: product.perPage
        }),
      },
    }).then(({ status, data }) => {
      if (200 === status) {
        setProduct(state => ({
          ...state,
          models: [...(state.models || []), ...data],
          modelsLoaded: true,
          isPageEnd: !data?.length,
        }));
      }
    }).catch(err => {
      setProduct(state => ({ ...state, modelsLoaded: true }));
    });
  };

  const retrievePopups = async () => {
    return httpService(`https://api.websetia.com/morita/mobile/Promotion.json?time=${moment().unix()}`, {
      method: 'post'
    }).then((data) => {
      setOptions(state => ({
        ...state,
        popupModels: data,
        popupModalOpen: true
      }));
    }).catch((err) => void(0));
  };

  const renderCarousel = ({ item, index }: ListRenderItemInfo<BannerModel>) => {
    const height = 130;

    return (
      <PressableBox
        key={index}
        containerStyle={styles.carouselItem}
        style={{ paddingHorizontal: 10}}
        opacity
        onPress={() => void(0)}
      >
        <Image source={{ uri: item.banner_foto }} style={[styles.carouselImage, { height }]} />
      </PressableBox>
    );
  };

  const renderBrand = ({ item, index }: ListRenderItemInfo<BrandModel>) => {
    return (
      <PressableBox
        key={index}
        opacity
        containerStyle={{
          flex: 0,
          marginHorizontal: 0,
          maxWidth: 80,
          marginTop: 10
        }}
        style={{ alignItems: 'center', }}
        onPress={() => navigation.navigatePath('Public', {
          screen: 'BottomTabs.HomeStack.Search',
          params: [null, null, {
            category: item,
          }],
        })}
      >
        {!item.fotobrand ? (
          <View style={[styles.brandImage, {
            backgroundColor: '#FEFEFE',
          }]} />
        ) : (
          <Image source={{ uri: item.fotobrand }} style={styles.brandImage} />
        )}

        
      </PressableBox>
    );
  };

  const renderArticle = ({ item, index }: ListRenderItemInfo<BannerModel>) => {
    const height = 130;
    return (
      <PressableBox
        key={index}
        containerStyle={styles.carouselItem}
        style={{ paddingHorizontal: 8, }}
        opacity
        onPress={() => void(0)}>
        <View style={[wrapper.row, { backgroundColor: '#FEFEFE', 
                                     borderColor: '#CCC', ...shadows[3], 
                                     height: 120, width: '95%', marginVertical: 10, }]}>
          <Image source={{ uri: item.banner_foto }} style={[styles.articleImage, { height }]} />

          <View style={{ borderColor: '#333', width: 205 }}>
            <Typography type="h4" style={{ marginTop: 5, fontSize: 14, paddingHorizontal: 10 }}>
              Judul Artikel
            </Typography>
            <Typography style={{ marginTop: 5, fontSize: 12, paddingHorizontal: 10, textAlign: 'justify'}} numberOfLines={4}>
              Lorem ipsum, utawa ringkesé lipsum, iku tèks standar sing dipasang kanggo nuduhaké èlemèn grafis utawa presentasi visual kaya font, tipografi, lan tata letak.
            </Typography>
          </View>
        </View>
      </PressableBox>

    );
  };

  const renderCategories = ({ item, index }: ListRenderItemInfo<CategoryModel>) => {
    return (
      <PressableBox
        key={index}
        opacity
        containerStyle={{
          flex: 1,
          marginHorizontal: 8,
          maxWidth: 100,
        }}
        style={{ alignItems: 'center', }}
        onPress={() => navigation.navigatePath('Public', {
          screen: 'BottomTabs.HomeStack.Search',
          params: [null, null, {
            category: item,
          }],
        })}
      >
        {!item.foto ? (
          <View style={[styles.categoryImage, {
            backgroundColor: '#FEFEFE',
          }]} />
        ) : (
          <Image source={{ uri: item.foto }} style={styles.categoryImage} />
        )}

        <Typography size="xxs" textAlign="center" style={{ marginTop: 5, fontSize: 12 }}>
          {item.ds}
        </Typography>
      </PressableBox>
    );
  };

  const handleModalToggle = async (type: string, open: boolean | null = null) => {
    switch (type) {
      case 'popup':
        setOptions(state => ({
          ...state,
          popupModalOpen: 'boolean' === typeof open ? open : !options.popupModalOpen
        }));
        break;
    }
  };

  return (
    <>
      <Products
        contentContainerStyle={styles.container}
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
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
        ListHeaderComponent={(
          <>
            {/* Banner Carousel */}
            <View style={{
              marginHorizontal: -10,
              position: 'relative',
            }}>
              {!slider.modelsLoaded ? (
                <View style={{ alignSelf: 'center' }}>
                  <BoxLoading width={width} height={width * 134 / 375} />
                </View>
              ) : (
                <Carousel
                  ref={carouselRef}
                  data={slider.models as any[]}
                  renderItem={renderCarousel}
                  sliderWidth={width}
                  itemWidth={width}
                  contentContainerStyle={{
                    marginHorizontal: 10,
                  }}
                  onSnapToItem={(activeIndex) => setSlider(state => ({
                    ...state,
                    activeIndex
                  }))}
                />
              )}

              <CarouselDots
                containerStyle={styles.carouselDots}
                activeIndexes={[slider.activeIndex]}
                dotCount={slider.models?.length || 0}
              />
            </View>

            {/*brands*/}
            <View style={[wrapper.row, { alignItems: 'center', marginTop: 15, marginBottom: 10, }]}>
              <Typography type="h4" color="black" style={{ flex: 1, paddingVertical: 4, fontSize: 12 }}>
                Brands
              </Typography>

              <Button
                containerStyle={[styles.actionBtnContainer, { marginTop: 0 }]}
                label={t('All Brands..', { count: 1 })}
                labelProps={{ type: 'p', size: 'sm' }}
                labelStyle={{ textAlign: 'right' }}
                size="lg"
                right={(
                  <Ionicons name="chevron-forward" size={18} color={'black'} />
                )}
                onPress={() => navigation.navigatePath('Public', {
                  screen: 'BottomTabs.NotificationStack.PromotionList'
                })}
              />
            </View>

            <View style={{marginTop: -20}}>
              <FlatList
                  data={brand.models || []}
                  renderItem={renderBrand}
                  contentContainerStyle={{
                    alignItems: 'center',
                      height: 100,
                      backgroundColor: '#FEFEFE',
                      paddingHorizontal: 0,
                      paddingVertical: 0,
                  }}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                />
            </View>

            {/* Category Carousel */}
            <View>
              <View style={[wrapper.row, { alignItems: 'center', marginTop: 15, }]}>
                <Typography type="h4" color="black" style={{ flex: 1, paddingVertical: 4, fontSize: 12 }}>
                  Categories
                </Typography>
              </View>
              <View style={{
                marginHorizontal: -8,
                marginBottom: 15,
                marginTop: -10,
                backgroundColor: '#FEFEFE',
                // ...(!category.modelsLoaded ? null : shadows[3])
              }}>
                {!brand.modelsLoaded ? (
                  <View style={[wrapper.row, {
                    justifyContent: 'center',
                    paddingVertical: 8,
                  }]}>
                    {Array.from(Array(5)).map((item, index) => (
                      <View key={index} style={{ marginHorizontal: 8 }}>
                        <BoxLoading width={48} height={48} />

                        <BoxLoading width={48} height={16} style={{ marginTop: 6 }} />
                      </View>
                    ))}
                  </View>
                ) : (
                  <FlatList
                    data={category.models || []}
                    renderItem={renderCategories}
                    contentContainerStyle={{
                      alignItems: 'center',
                      height: 150,
                      backgroundColor: '#FEFEFE',
                      paddingHorizontal: 0,
                      paddingVertical: 0,
                    }}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                  />
                )}
              </View>
            </View>

            {/*Artikel*/}
            <View>
              <View style={[wrapper.row, { alignItems: 'center', marginTop: -15 }]}>
                <Typography type="h4" color="black" style={{ flex: 1, paddingVertical: 4, fontSize: 12 }}>
                  Article
                </Typography>
              </View>
                  {!slider.modelsLoaded ? (
                    <View style={{ alignSelf: 'center' }}>
                      <BoxLoading width={width} height={width * 134 / 375} />
                    </View>
                  ) : (
                    <Carousel
                      ref={carouselRef}
                      data={slider.models as any[]}
                      renderItem={renderArticle}
                      sliderWidth={width}
                      itemWidth={width}
                      contentContainerStyle={{
                        marginHorizontal: 8,
                      }}
                      onSnapToItem={(activeIndex) => setSlider(state => ({
                        ...state,
                        activeIndex
                      }))}
                    />
                  )}
            </View>

            {/*
            <View style={[wrapper.row, { alignItems: 'center', marginTop: 15, marginBottom: 10, }]}>
              <Typography type="h4" color="black" style={{ flex: 1, paddingVertical: 4, fontSize: 12 }}>
                Products
              </Typography>

              <Button
                containerStyle={[styles.actionBtnContainer, { marginTop: 0 }]}
                label={t('All Products..', { count: 1 })}
                labelProps={{ type: 'p', size: 'sm' }}
                labelStyle={{ textAlign: 'right' }}
                size="lg"
                right={(
                  <Ionicons name="chevron-forward" size={18} color={'black'} />
                )}
                onPress={() => navigation.navigatePath('Public', {
                  screen: 'BottomTabs.NotificationStack.PromotionList'
                })}
              />
            </View>
             */}
          </>
        )}
        // LoadingView={(
        //   <ProductsLoading />
        // )}
        // ListEmptyComponent={!product.modelsLoaded ? (
        //   <ProductsLoading />
        // ) : product.models?.length ? null : (
        //   <Typography textAlign="center" style={{ marginVertical: 12 }}>
        //     {t(`Tidak ada produk`)}
        //   </Typography>
        // )}
        // ListFooterComponent={!product.isPageEnd ? null : (
        //   <Typography size="sm" textAlign="center" color={700} style={{ marginTop: 16 }}>
        //     {t(`Sudah menampilkan semua produk`)}
        //   </Typography>
        // )}
      />

      {/*
      {!options.popupModels.length ? null : (
        <PopupPromoModal
          isVisible={options.popupModalOpen}
          swipeDirection={null}
          onBackButtonPress={() => handleModalToggle('popup', false)}
          onBackdropPress={() => handleModalToggle('popup', false)}
          onComplete={() => handleModalToggle('popup', false)}
          Promotions={options.popupModels}
        />
      )}
      */}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingBottom: 24,
    backgroundColor: '#FEFEFE'
  },
  kategori: {
    fontFamily: "roboto-regular",
    color: "#121212",
    marginTop: 15,
    marginBottom: 5,
    fontWeight: 'bold'
  },
  seeall: {
    fontFamily: "roboto-regular",
    color: "#204c29",
  },
  carousel: {
    position: 'relative',
  },
  carouselDots: {
    position: 'absolute',
    left: 0,
    bottom: 25,
    zIndex: 10,
  },

  carouselItem: {
    width: '100%',
    backgroundColor: '#FEFEFE',
  },
  carouselImage: {
    width: '100%',
    resizeMode: 'stretch',
    marginRight: 10,
  },
  categoryImage: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginHorizontal: 10,
  },
  articleImage: {
    width: 120,
    height: '100%',
    resizeMode: 'contain',
    marginHorizontal: 10,
  },
  brandImage: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
    marginHorizontal: 5,
  },
  actionBtnContainer: {
    backgroundColor: colors.white,
    borderRadius: 0,
    marginRight: -20,
    color: 'blue'
  },
});

export default Home;
