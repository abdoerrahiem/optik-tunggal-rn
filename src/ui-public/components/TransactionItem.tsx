import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, ToastAndroid, View, ViewProps } from 'react-native';
import { Button, ButtonProps, PressableBox, Typography } from '../../ui-shared/components';
import { colors, wrapper } from '../../lib/styles';
import * as Animatable from 'react-native-animatable';
import { AddressModel, CartModel, Modelable, PaymentMethodType, ProductModel, TransactionModel, TransactionStatus } from '../../types/model';
import { FigmaIcon } from '../../assets/icons';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import numeral from 'numeral';
import { getStatusColor, getStatusText, httpService, showPhone } from '../../lib/utilities';
import { useAppNavigation } from '../../router/RootNavigation';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { PAYMENT_IMAGES } from '../pages/company/PaymentMethod';
import { BoxLoading } from '../../ui-shared/loadings';
import { PAYMENT_METHODS } from '../pages/orders/PaymentMerchant';
import Clipboard from '@react-native-clipboard/clipboard';

type Props = ViewProps & {
  transaction: TransactionModel;
  collapse?: boolean;
  onDetailPress?: (transaction: TransactionModel) => void;
  onPayPress?: (transaction: TransactionModel) => void;
  onInfoUpdate?: (transaction: TransactionModel) => void;
};

function TransactionItem({
  transaction,
  collapse: isCollapse = true,
  onDetailPress,
  onPayPress,
  onInfoUpdate,
  style,
  ...props
}: Props) {
  // Hooks
  const navigation = useAppNavigation();
  const { t } = useTranslation('notification');

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [collapse, setCollapse] = useState<boolean>(true);
  const [contentHi, setContentHi] = useState<number>(0);

  const [cart, setCart] = useState<Modelable<CartModel>>({
    models: [],
    modelsLoaded: false,
  });
  const [address, setAddress] = useState<AddressModel | null>(null);
  const [price, setPrice] = useState({
    total: 0,
    courier: 0,
  });

  // Effects
  useEffect(() => {
    retrieveInfo();
    // retrieveTransactions();
  }, []);

  useEffect(() => {
    if (collapse && !cart.modelsLoaded) {
      retrieveInfo();
      // retrieveTransactions();
    }
  }, [collapse]);

  useEffect(() => {
    setCollapse(isCollapse);
  }, [isCollapse]);

  // const retrieveTransactions = async () => {
  //   return httpService('/api/transaction/transaction', {
  //     data: {
  //       act: 'TrxListItem',
  //       dt: JSON.stringify({ kdcust : userModel.kd_customer }),
  //     }
  //   }).then(({ status, data }) => {
      
  //   }).catch(() => {
      
  //   });
  // };

  // Vars
  const retrieveInfo = async () => {
    // setIsLoading(true);

    return httpService('/api/transaction/transaction', {
      data: {
        act: 'TrxDetail',
        dt: JSON.stringify({ idtrx : transaction.orderno }),
      }
    }).then(({ status, data, item, shipTo }) => {
      // setIsLoading(false);

      transaction.methodid = data.methodid;

      const cartItems = 200 !== status ? [] : itemsToCart(item || []);
      const infoAddress = !shipTo ? null : {
        id: shipTo.id,
        alamat: shipTo.ship_alamat,
        vch_nama: shipTo.ship_nama,
        hp: shipTo.ship_hp,
      };

      setCart(state => ({
        ...state,
        models: cartItems,
        modelsLoaded: true,
      }));

      setAddress(infoAddress);
    }).then(() => {
      // setIsLoading(false);

      setCart(state => ({
        ...state,
        modelsLoaded: true
      }));
    });
  };

  const itemsToCart = (items: any[]): CartModel[] => {
    let priceTotal = 0;
    const cartItems = items.map((item): CartModel => {
      const subtotal = parseFloat(item.amount) || (parseFloat(item.qtyorder) * parseFloat(item.unit_price));
      priceTotal += subtotal;
 
      return {
        product: {
          prd_id: item.prdid,
          prd_no: item.prdno,
          prd_ds: item.prdds,
          prd_foto: item.foto || item.prdfoto || item.prd_foto,
        },
        qty: parseFloat(item.qtyorder),
        harga: item.unit_price,
      };
    });

    setPrice(state => ({
      ...state,
      total: priceTotal
    }));

    return cartItems;
  };

  const getTransactionWithInfo = (): TransactionModel => {
    return {
      ...transaction,
      payment_method: paymentMethod,
      address: address || undefined,
      cart_items: cart.models,
      grand_total: price.total + price.courier,
    }
  };

  const renderHeaderShrink = () => {
    return (
      <View style={{
        paddingVertical: 8,
        paddingHorizontal: 15,
      }}>
        <View style={[wrapper.row]}>
          <FigmaIcon.FigmaShoppingBag width={24} height={24} color={colors.gray[900]} />
          <Typography size="xs" style={{ marginTop: 4, marginBottom: 10, marginLeft: 10, fontWeight: 'bold'}}>
            {`${transaction.nm_store}`}
          </Typography>
        </View>
        <View style={[wrapper.row, { alignItems: 'center' }]}>
          <View style={{ flex: 1, marginRight: 15 }}>
            <Typography size="xs">
            {`${transaction.orderno}`}
            </Typography>

            <Typography size="xs">
              {moment(transaction.ordertgl, 'YYYYMMDD').format('D MMMM YYYY')}
            </Typography>
          </View>

          <View>
            <Typography size="xs">
              Lihat Detail
              <Ionicons name="chevron-down" size={16} color={colors.gray[900]} />
            </Typography>
            <Typography
              heading
              size="xs"
              color={getStatusColor(status)}
              style={{ alignSelf: 'flex-end' }}
            >
              {getStatusText(status)}
            </Typography>
          </View>
        </View>
        {!cartItem?.product ? null : (
          <View style={[styles.headerCart, { marginTop: 8 }]}>
            <View style={[wrapper.row]}>
              {!cartItemImage ? null : (
                <Image source={{ uri: cartItemImage }} style={styles.headerCartImage} />
              )}
              <View style={{ flex: 1, paddingTop: 4 }}>
                <View style={{ flex: 1 }}>
                  <Typography size="xs">
                    {cartItem.product?.prd_ds}
                  </Typography>
                </View>

                <View style={[wrapper.row, { marginTop: 'auto', paddingTop: 12 }]}>
                  <Typography size="xs" style={{ flex: 1 }}>
                    {t(`Total`)} {`(${cart_items?.length || 0} ${t(`item`)})`}
                  </Typography>

                  <Typography heading size="xs">
                    {numeral(price.total || 0).format()}
                  </Typography>
                </View>
              </View>
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderHeaderExpand = () => {
    return (
      <View style={{
        paddingVertical: 12,
        paddingHorizontal: 15,
      }}>
        <View style={[wrapper.row, { alignItems: 'flex-end' }]}>
          <View style={{ flex: 1, marginRight: 15 }}>
            <Typography heading size="xs" color={getStatusColor(status)}>
              {getStatusText(status)}
            </Typography>

            <Typography size="xs" style={{ marginTop: 4 }}>
              {`${transaction.orderno}`}
            </Typography>
          </View>

          <View style={{ alignItems: 'flex-end' }}>
            {['proses', 'diterima'].indexOf(status || '') < 0 ? (
              <Typography size="xs">
                Tutup Detail
                <Ionicons name="chevron-up" size={16} color={colors.gray[900]} />
              </Typography>
            ) : (
              <PressableBox
                containerStyle={{ alignSelf: 'flex-end' }}
                onPress={!onDetailPress ? null : () => onDetailPress(transaction)}
              >
                <Typography size="xs" style={{ borderBottomWidth: 1, borderColor: colors.gray[700] }}>
                  {t(`View Detail`)}
                </Typography>
              </PressableBox>
            )}

            <Typography size="xs" style={{ marginTop: 4 }}>
              {moment(transaction.ordertgl, 'YYYYMMDD').format('D MMMM YYYY')}
            </Typography>
          </View>
        </View>
        <Typography size="xs" style={{ marginTop: 4, marginBottom: 10 }}>
          {`${transaction.nm_store}`}
        </Typography>
        {!cartItem?.product ? 
          <Typography size="xs" style={{ marginTop: 20, textAlign: 'center'}}>
            {t(`Detail produk tidak ada.`)}
          </Typography>
        : (
          <View style={[styles.headerCart, { marginTop: 8 }]}>
            <View style={[wrapper.row, { flex: 1 }]}>
              <Typography size="xs" heading style={{flex: 1}}>
                {`Nama Item/Produk`}
              </Typography>

              <Typography size="xs" heading style={{ marginTop: 2 }}>
                {`Qty`}
              </Typography>
            </View>

            {cart_items?.map((item, index) => {
              const image = !item?.product?.images?.length ? item?.product?.prd_foto : item.product.images[0].prd_foto;

              return (
                <View key={index} style={[wrapper.row, { marginTop: 5 }]}>
                  {!image ? null : (
                    <Image source={{ uri: image }} style={styles.headerCartImage} />
                  )}

                  <View style={{ flex: 1, paddingTop: 2 }}>
                    <View style={[wrapper.row, { flex: 1 }]}>
                      <Typography size="xs" style={{flex: 1}}>
                        {item.product?.prd_ds} {`\nSKU : ${item.product?.prd_id}`}
                      </Typography>

                      <Typography size="xs" style={{ marginTop: 2 }}>
                        {`${item.qty || 0}`}
                      </Typography>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  const { models: cart_items } = cart;
  const status = transaction.orderstatus as TransactionStatus;

  const cartItem = !cart_items?.length ? null : cart_items[0];
  const cartItemImage = !cartItem?.product?.images?.length ? cartItem?.product?.prd_foto : cartItem.product.images[0].prd_foto;

  const paymentMethod: PaymentMethodType = {
    nama: transaction.methodds,
    image: PAYMENT_IMAGES['1' === transaction.methodid ? 'Mandiri' : 'COD']
  };

  return (
    <View style={[styles.container, style, 
                { borderColor: '#cccccc',
                  borderRadius: 5, 
                  borderWidth: 1 }]} {...props}>
      <PressableBox
        containerStyle={{ marginHorizontal: 0, overflow: 'visible' }}
        style={{ paddingHorizontal: 0 }}
        onPress={() => setCollapse(!collapse)}
      >
        {collapse ? renderHeaderShrink() : renderHeaderExpand()}
      </PressableBox>

      <Animatable.View
        style={[
          styles.contentWrapper,
          { height: collapse ? 0 : contentHi },
        ]}
        duration={250}
        transition="height"
        easing="ease-in-out"
      >
        <View
          onLayout={({ nativeEvent: { layout } }) => {
            const { height } = layout;

            setContentHi(height);
          }}
          style={styles.content}
        >
          <>
            {!price.total ? null : (
              <View style={[styles.contentSection, { marginTop: 12 }]}>
                <View style={[wrapper.row, { alignItems: 'flex-end' }]}>
                  <Typography size="xs" heading style={{ width: 140, flex: 1 }}>
                    {`${t(`Total`)}`} {`(${cart_items?.length || 0} ${t(`item`)})`}
                  </Typography>

                  <Typography style={{ flex: 1, textAlign: 'right' }} heading>
                    {numeral(price.total + price.courier).format()}
                  </Typography>
                </View>
              </View>
            )}

            {/* {renderAction()} */}
          </>
        </View>
      </Animatable.View>
    </View>
  )
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 4,
    backgroundColor: colors.white,
    overflow: 'hidden'
  },

  headerCart: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.transparent('palettes.primary', 0.5),
  },
  headerCartImage: {
    width: 64,
    height: 64,
    borderRadius: 10,
    marginRight: 12,
    resizeMode: 'contain'
  },

  contentWrapper: {
    overflow: 'hidden',
    height: 0,
  },
  content: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingTop: 8,
    paddingHorizontal: 15,
    paddingBottom: 15,
  },

  contentSection: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray[400],
  }
});

export default TransactionItem;