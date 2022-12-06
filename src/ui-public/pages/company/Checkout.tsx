import { RouteProp, useRoute } from '@react-navigation/core';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, useWindowDimensions, View, FlatList, Alert, ToastAndroid } from 'react-native';
import { colors, wrapper } from '../../../lib/styles';
import { useAppNavigation } from '../../../router/RootNavigation';
import { AddressModel, CartModel, Modelable, ShippingModel } from '../../../types/model';
import { Button, Header, PressableBox, Typography, BottomDrawer } from '../../../ui-shared/components';
import { BoxLoading } from '../../../ui-shared/loadings';
import numeral from 'numeral';
import { PublicHomeStackParamList } from '../../../router/publicBottomTabs';
import { useAppSelector } from '../../../redux/hooks';
import { useDispatch } from 'react-redux';
import { fetchAddresses } from '../../../redux/actions';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { httpService, showPhone } from '../../../lib/utilities';
import { ErrorState, ValueOf } from '../../../types/utilities';
import { pushCartItem } from '../../../redux/actions/shopActions';
import { default as _omit } from 'lodash/omit';
import {
  formatCurrency,
  getSupportedCurrencies,
} from "react-native-format-currency";

type Fields = {
  shipping?: string;
};

type OptionsState = {
  shipping?: ShippingModel[];
  shippingLoaded?: boolean;
  shippingModalOpen?: boolean;
};

function Checkout() {
  // Hooks
  const navigation = useAppNavigation();
  const route = useRoute<RouteProp<PublicHomeStackParamList, 'Checkout'>>();
  const { width, height } = useWindowDimensions();
  const { user: { user, location, address: addressState } } = useAppSelector((state) => state);
  const dispatch = useDispatch();
  const { t } = useTranslation('home');

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [jasaOngkir, setJasaOngkir] = useState({})
  const [jenisOngkir, setJenisOngkir] = useState()
  const [ekspedisi, setEkspedisi] = useState()
  const [cart, setCart] = useState<Modelable<CartModel>>({
    models: [],
    modelsLoaded: false,
  });
  const [address, setAddress] = useState<Modelable<AddressModel>>({
    model: null,
    modelLoaded: false,
  });
  const [price, setPrice] = useState({
    harga: 0,
    total: 0,
    itemqty: 0
  });
  const [options, setOptions] = useState<OptionsState>({
    shipping: [],
    shippingLoaded: false,
    shippingModalOpen: false,
  });
  const [fields, setFields] = useState<Fields>({
    shipping: ''
  });

  // Effects
  useEffect(() => {
    handleRefresh();
  }, []);

  useEffect(() => {
    if (route.params?.cart_items) {
      setCart(state => ({
        ...state,
        models: route.params?.cart_items,
        modelsLoaded: true,
      }));
    }

    if (route.params?.address) {
      setAddress(state => ({
        ...state,
        model: route.params.address,
        modelLoaded: true,
      }));
    }
  }, [route.params]);

  useEffect(() => {
    calculatePrice();
  }, [cart.models]);

  useEffect(() => {
    if (addressState.modelsLoaded) {
      setAddress(state => ({
        ...state,
        model: (addressState.models || [])[0],
        modelLoaded: true
      }));
    }
  }, [addressState.modelsLoaded]);

  // Vars
  const handleRefresh = async () => {
    setIsLoading(true);
    await retrieveAddress();
    setIsLoading(false);
  };

  const { model: addressModel } = address;
  let canSubmit = true;
  let shippingField: keyof Fields = 'shipping';
  let shippingStepRequired = '';
  let shippingModalListLoaded: boolean = false;
  let shippingModalList: ShippingModel[] = [];
  let shipModalOpen = options.shippingModalOpen;


  if (options.shippingModalOpen) {
    shippingField = 'shipping';
    shippingModalList = options.shipping || [];
    shippingModalListLoaded = !!options.shippingModalOpen;
  } 

  const retrieveAddress = async () => {
    dispatch(fetchAddresses());
  };

  const retrieveOngkir = async (kodepos: any) => {
    setOptions(state => ({
      ...state,
      shipping: [],
      shippingLoaded: false,
    }));

    return await httpService('/api/zonasi/zonasi', {
      data: {
        act: 'GetOngkir',
        dt: JSON.stringify({kodepos: kodepos})
      }
    }).then(({ status, data }) => {
      if (status === 200) {
        setOptions(state => ({
          ...state,
          shipping: data,
          shippingLoaded: true,
        }));
      }
    });
  };

  const calculatePrice = () => {
    let harga = 0;
    let total = 0;
    let itemqty = 0;

    cart.models?.forEach(({ qty = 1, ...item }, index) => {
      const { product: itemProduct } = item;
      const discount = itemProduct?.diskon;
      const subtotalOriginal = ((itemProduct?.harga || 0) * 100 / (100 - parseFloat(discount || '0'))) * qty;
      const subtotal = Number(item.product?.harga)/Number(item.product?.package)*Number(qty);
  
      harga += subtotalOriginal;
      total += subtotal;
      itemqty += qty;
    });

    setPrice(state => ({
      ...state,
      harga,
      total,
      itemqty
    }));
  };

  const handleModalToggle = async (type: string, open: boolean | null = null, kodepos: number) => {
    if(kodepos === 0){
      Alert.alert( "", "Alamat pengiriman tidak lengkap, silahkan lengkapi alamat pengiriman untuk proses pesanan.",
        [
          { text: "Lengkapi Sekarang", onPress: () => navigation.navigatePath('Public', {
            screen: 'AddressList',
          })
          }
        ]
      );
    }else{
      let newState: Partial<OptionsState> = {};
      switch (type) {
        case 'shipping':
          newState.shippingModalOpen = 'boolean' === typeof open ? open : !options.shippingModalOpen;
          break;
      }

      retrieveOngkir(kodepos);
      setOptions(state => ({
        ...state,
        ...newState,
      }));
    }
  };

  const handleCloseModal = async () => {
    handleModalToggle('shipping', false);
  };

  const handleFieldChange = (field: keyof Fields, value: ValueOf<Fields>) => {
    const _isShipCost = options.shipping?.find(item => item.id === value);
    OngkosKirim(_isShipCost?.shipcost)
    JenisOngkosKirim(' - '+_isShipCost?.ekspedisi_name+' '+_isShipCost?.keterangan)
    ekspedisiName(_isShipCost?.ekspedisi_name)
    setFields(state => ({
      ...state,
      [field]: value,
    }));
    handleCloseModal();
  };

  const OngkosKirim = (ongkir: any) =>{
    setJasaOngkir(ongkir);
  }

  const JenisOngkosKirim = (jnsOngkir: any) =>{
    setJenisOngkir(jnsOngkir);
  }

  const ekspedisiName = (isNameEkspedisi: any) =>{
    setEkspedisi(isNameEkspedisi);
  }

  const handlePay = async () => {
    if(jenisOngkir === undefined){
      ToastAndroid.show(`${''}Pengiriman belum dipilih!`, ToastAndroid.LONG)
    }else{  
      navigation.navigatePath('Public', {
        screen: 'PaymentMethod',
        params: [{
          cart_items: cart.models,
          address: address.model,
          price_total: price.total,
          ekspedisi: ekspedisi,
          jenis: jenisOngkir,
          biayaongkir: jasaOngkir
        }],
      });
    }
  };

  if (!address.model) {
    canSubmit = false;
  }

  return (
    <View style={{ flex: 1 }}>
      <Header
        left
        title={[
          `${t('Checkout')}`,
        ]}
      />

      <ScrollView contentContainerStyle={styles.container}>
        {!address.modelLoaded ? (
          <View style={{ paddingVertical: 12 }}>
            <BoxLoading width={[90, 120]} height={18} />
            <BoxLoading width={[200, 240]} height={18} style={{ marginTop: 4 }} />
            <BoxLoading width={[160, 200]} height={18} style={{ marginTop: 4 }} />
          </View>
        ) : (
          !address.model ? (
            <View style={[wrapper.row, { paddingVertical: 12 }]}>
              <Typography size="sm" style={{paddingVertical: 3, paddingHorizontal: 5}}>
                {t('Belum ada alamat')}
              </Typography>

              <PressableBox
                containerStyle={{ alignSelf: 'flex-end', flex: 1 }}
                onPress={() => navigation.navigatePath('Public', {
                  screen: 'AddressForm',
                  params: [null, null, {
                    action_screen: ['Public', 'Checkout'],
                  }]
                })}
              >
                <View style={[wrapper.row, { alignSelf: 'flex-end' }]}>
                  <Typography color="#0d674e" style={{
                    borderWidth: 1,
                    borderColor: "#0d674e",
                    paddingVertical: 3,
                    paddingHorizontal: 5,
                    borderRadius: 5,
                    fontSize: 12
                  }}>
                    <Ionicons name="location" size={12} color="#0d674e" />
                    {`${t('Tambah')}`}
                  </Typography>
                </View>
              </PressableBox>
            </View>
          ) : (
            <View style={{ paddingVertical: 12 }}>
              <View style={[wrapper.row]}>
                <Typography size="xs" style={{ marginTop: 4, flex: 1 }}>
                  Dikirim ke : {` `}
                  <Typography size='xs' style={{fontWeight: 'bold'}}>
                      {addressModel?.title}
                    </Typography>
                </Typography>
                {Number(addressModel?.kodepos) === 0 ? 
                  (
                    <PressableBox
                        containerStyle={{alignSelf: 'center'}}
                        style={{alignItems: 'center'}}
                        onPress={() => navigation.navigatePath('Public', {
                          screen: 'AddressList',
                        })}
                      >
                      <Typography size='xs' style={{
                        color: '#0d674e'
                      }}>
                        <Ionicons name="location" size={12} color="#0d674e" />
                        {`${t('Ubah alamat')}`}
                      </Typography>
                    </PressableBox>
                  )
                  :
                  (
                    <PressableBox
                        containerStyle={{alignSelf: 'center'}}
                        style={{alignItems: 'center'}}
                        onPress={() => navigation.navigatePath('Public', {
                          screen: 'AddressList',
                          params: [{
                            action_screen: ['Public', 'Checkout'],
                          }]
                        })}
                      >
                      <Typography size='xs' style={{
                        color: '#0d674e'
                      }}>
                        <Ionicons name="location" size={12} color="#0d674e" />
                        {`${t('Pilih alamat lain')}`}
                      </Typography>
                    </PressableBox>
                  )
                }
              </View>
              <View style={[wrapper.row, {flex: 1, marginRight: 10}]}>
                <View style={{flex: 1}}>
                  <Typography size="xs" style={{ marginTop: 4, fontWeight: 'bold' }}>
                    {addressModel?.nama || addressModel?.vch_nama}
                  </Typography>
                  <Typography size="xs" style={{ marginTop: 0, textAlign: 'justify'}}>
                    {showPhone(addressModel?.hp, '0')+'\n'}
                    {addressModel?.alamat}
                  </Typography>
                  {Number(addressModel?.kodepos) === 0 ? 
                    (
                      <Typography size="xxs" style={{ marginTop: 4, color: 'red', textAlign: 'justify' }}>
                        Warning : Alamat tidak lengkap, silahkan ubah alamat pengiriman.
                      </Typography>
                    ) : null}
                </View>
              </View>
            </View>
          )
        )}
        {!cart.modelsLoaded ? (
          <View style={{
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: colors.gray[400]
          }}>
            {[1, 2].map((item, index) => (
              <View key={item} style={[wrapper.row, { alignItems: 'center', marginTop: index === 0 ? 0 : 12 }]}>
                <BoxLoading width={56} height={56} />

                <View style={{ flex: 1, paddingLeft: 15 }}>
                  <BoxLoading width={180} height={16} />
                  <BoxLoading width={[100, 120]} height={16} style={{ marginTop: 4 }} />
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={{
            flex: 1,
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: colors.gray[400]
          }}>
            {!cart.models?.length ? (
              <Typography textAlign="center">
                {`${t('Keranjang Belanjamu Kosong')}`}
              </Typography>
            ) : (
              cart.models.map((item, index) => (
                <View
                  key={index}
                  style={[
                    styles.cartRow,
                    { marginTop: index === 0 ? 0 : 12 }
                  ]}
                >
                  <View style={styles.cartContent}>
                    <View style={[wrapper.row]}>
                      {!item.product?.prd_foto ? null : (
                        item.product?.merk == 'ADLENS' ? 
                        <Image source={{ uri: item.product?.prd_foto }} style={styles.cartImage} /> :
                        <Image source={{ uri: item.product?.images[0].prd_foto }} style={styles.cartImage} />
                      )}
                      <View style={{ flex: 1, paddingHorizontal: 10 }}>
                        
                        <Typography size='xs'>
                          {item.product?.prd_ds}
                        </Typography>
                        <View style={{ alignItems: 'flex-start' }}>
                          <View style={[wrapper.row, {marginTop: 5}]}>
                            <Typography size='xs' style={{fontWeight: '700',flex: 1}}>
                              {/* Rp{item.product?.harga || 0 (item.qty || 1)} */}
                              {item.pid === item.pid && item.paket > 1 
                                ? 
                                formatCurrency({ amount: Number(item.product?.harga)/Number(item.product?.package)*Number(item.qty), code: 'IDR' }) 
                                : 
                                formatCurrency({ amount: Number(item.product?.harga)*Number(item.qty), code: 'IDR' }) 
                              }
                            </Typography>
                            {!item.qty ? null : (
                              <Typography size="xs" color={700} style={{ marginBottom: 2, alignSelf: 'flex-end' }}>
                                {`${t('Qty')}: ${item.qty}`}
                              </Typography>
                            )}
                          </View>
                          {item.atributColor === '' || item.atributColor === '' ? null :
                            <View>
                              {item.product?.description == "ACCS" ? null : (
                                  <Typography size="xs" style={{ marginTop: 2 }}>
                                    Kode : {item.pid || item.pid2}
                                  </Typography>
                                )
                              }
                              {item.atributSpheries3 === '' ? null :
                              (
                                <View>
                                  <Typography size="xs" style={{ marginTop: 2 }}>
                                    Warna : {item.atributColor === '0' ? 'CLEAR' : item.atributColor || item.atributColor3}
                                  </Typography>
                                  <Typography size="xs" style={{ marginTop: 2 }}>
                                    Ukuran : {item.atributSpheries || item.atributSpheries3}
                                  </Typography>
                                </View>
                              )}
                              
                              {item.atributBcurve3 === '' ? null :
                              (
                                <Typography size="xs" style={{ marginTop: 2 }}>
                                  Base Curve : {item.atributBcurve == '' ? '-' : item.atributBcurve}
                                </Typography>
                              )}
                            </View>
                          }
                        </View>
                        {!item.note ? null : (
                          <Typography size="sm" color={700} style={{ marginTop: 2 }}>
                            {`${t('Catatan')}: ${item.note}`}
                          </Typography>
                        )}
                      </View>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
        <View style={{marginVertical: 20, borderColor: '#333', borderWidth: 1, borderRadius: 5}}>
          <PressableBox
              onPress={() => handleModalToggle('shipping', true, addressModel?.kodepos)}
            >
              <View style={[wrapper.row]}>
                <Typography size='xs' style={{
                  color: '#0d674e',
                  paddingHorizontal: 10,
                  paddingVertical: 15,
                  height: 'auto',
                  textAlignVertical: 'center',
                  flex: 1
                }}>
                  {`${t('   Pilih Pengiriman')}`} {jenisOngkir}
                </Typography>
                <Image source={require('../../../assets/icons/figma/shippingtruck.png')} style={{width: 24, height: 24, marginRight: 10, marginTop: 10}}/>
              </View>
          </PressableBox>
        </View>
        {!cart.modelsLoaded ? null : (
          <View style={styles.action}>
            <View style={[wrapper.row, { alignItems: 'center' }]}>
              <Typography size='xs' color="black" style={{ flex: 1, paddingVertical: 4 }}>
                {`${t('Jumlah '+'('+price.itemqty+' item)')}`}
              </Typography>

              <Typography textAlign="right">
                <Typography size='xs'>
                  {formatCurrency({ amount: Number(price.total), code: 'IDR' })}
                </Typography>
              </Typography>
            </View>
            <View style={[wrapper.row, { alignItems: 'center' }]}>
              <Typography size='xs' color="black" style={{ flex: 1, paddingVertical: 4 }}>
              {`${t('Ongkos Kirim')}`}
              </Typography>
              <Typography textAlign="right">
                <Typography size='xs'>
                  {jasaOngkir > 0 ? (
                    formatCurrency({ amount: Number(jasaOngkir), code: 'IDR' })
                  ) : (
                    formatCurrency({ amount: Number(0), code: 'IDR' })
                  )}
                </Typography>
              </Typography>
            </View>
            <View style={{borderBottomColor: '#333', borderWidth: 1, marginVertical: 5, borderRadius: 1}}></View>
            <View style={[wrapper.row, { alignItems: 'center' }]}>
              <Typography size='sm' color="black" style={{ flex: 1, paddingVertical: 4, fontWeight: '700' }}>
                {`${t('Total Harga')}`}
              </Typography>

              <Typography textAlign="right">
                <Typography size='sm' style={{fontWeight: '700'}}>
                  {jasaOngkir > 0 ? (
                    formatCurrency({ amount: Number(price.total)+Number(jasaOngkir), code: 'IDR' })
                  ) : (
                    formatCurrency({ amount: Number(price.total), code: 'IDR' })
                  )}
                </Typography>
              </Typography>
            </View>

            <Button
                containerStyle={{ marginTop: 16, alignSelf: 'center', marginVertical: 10, backgroundColor: '#0d674e', borderRadius: 5 }}
                style={{ width: 300 }}
                onPress={handlePay}
                disabled={Number(addressModel?.kodepos) === 0 ? true : !canSubmit}
                loading={isSaving}
              >
              <Typography size='xs' style={{textAlign: 'center', paddingVertical: 3, color: '#FEFEFE'}}>
                {`${t('Pilih Metode Pembayaran')}`.toUpperCase()}
              </Typography>
            </Button>
          </View>
        )}
      </ScrollView>
      <BottomDrawer
        isVisible={shipModalOpen}
        swipeDirection={null}
        onBackButtonPress={() => handleModalToggle('shipping', false, addressModel.kodepos)}
        style={{ height: shippingModalList.length == 0 ? 200 : 400, }}
      >
        <View style={[wrapper.row]}>
          <Typography style={{ flex: 1, fontWeight: 'bold', fontSize: 16, marginLeft: 30 }}>Pilih Pengiriman</Typography>
        </View>
        <View style={{ borderColor: '#ccc', borderWidth: 1, marginHorizontal: 30 }}></View>
        {!shipModalOpen ? null : (
          shippingStepRequired ? (
            // Required to select parent location
            <View style={styles.modalContainer}>
              <Typography>{shippingStepRequired}</Typography>
            </View>
          ) : (
            !shippingModalListLoaded ? (
              // Show loading
              <View style={styles.modalContainer}>
                {[1, 2, 3, 4, 5].map((item, index) => (
                  <BoxLoading
                    key={index}
                    width={[190, 240]}
                    height={20}
                    style={{ marginTop: index === 0 ? 0 : 10, marginLeft: 15 }}
                  />
                ))}
              </View>
            ) : (
              // Shipping List
              shippingModalList.length == 0 ?
              (
                <Typography size='sm' style={{paddingHorizontal: 30, paddingVertical: 50, textAlign: 'center'}}>Sedang memuat data pengiriman..</Typography>
              ) 
              :
              (
                <FlatList
                  data={shippingModalList}
                  style={{ maxHeight: height * 0.66, backgroundColor: '#FEFEFE' }}
                  contentContainerStyle={styles.modalContainer}
                  renderItem={({ item, index }) => (
                    <PressableBox
                      key={index}
                      containerStyle={{
                        backgroundColor: fields['shipping'] === item.id ? '#ececec' : undefined,
                        marginHorizontal: 10
                      }}
                      style={{ paddingVertical: 15 }}
                      onPress={() => handleFieldChange('shipping', item.id)}
                    >
                      <View style={[wrapper.row]}>
                        <Image source={{uri: item.image}} style={{width: 50, height: 24, resizeMode: 'stretch'}}/>
                        <View style={{flex: 1}}>
                          <Typography size='sm' style={{paddingHorizontal: 5}}>
                            {item.keterangan+`\n`}
                            <Typography size='xxs' style={{fontStyle: 'italic'}}>{`Estimasi tiba `+item.estimasi+' lagi.'}</Typography>
                          </Typography>
                        </View>
                        <View>
                          <Typography size='sm' style={{alignSelf: 'flex-end', color: '#0d674e'}}>
                            {formatCurrency({ amount: Number(item.shipcost), code: 'IDR' })}
                          </Typography>
                        </View>
                      </View>
                    </PressableBox>
                  )}
                />
              )
            )
          )
        )}
      </BottomDrawer>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 15,
    paddingBottom: 16,
    backgroundColor: colors.white,
  },

  cartRow: {},
  cartContent: {
    ...wrapper.row,
    alignItems: 'center',
  },
  cartImage: {
    width: 60,
    height: 40,
    resizeMode: 'stretch',
    borderRadius: 8,
  },
  cartAction: {
    ...wrapper.row,
    alignItems: 'center',
    marginTop: 12,
  },
  column:{
    width: '15%', 
    height: 20, 
    backgroundColor: 'red',
    justifyContent:"center",
    marginHorizontal: 10,
    borderRadius: 3
  },
  action: {
    paddingTop: 8,
    paddingBottom: 16,
    paddingHorizontal: 15,
    borderTopWidth: 1,
    borderColor: colors.gray[400],
    backgroundColor: colors.white
  },
  modalContainer: {
    paddingHorizontal: 15,
    paddingTop: 12,
    paddingBottom: 24
  },
});

export default Checkout;
