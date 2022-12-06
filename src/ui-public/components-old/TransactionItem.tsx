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
  }, []);

  useEffect(() => {
    if (collapse && !cart.modelsLoaded) {
      retrieveInfo();
    }
  }, [collapse]);

  useEffect(() => {
    setCollapse(isCollapse);
  }, [isCollapse]);

  // Vars
  const retrieveInfo = async () => {
    setIsLoading(true);

    return httpService('/order/list', {
      data: {
        act: 'MPInfo',
        dt: JSON.stringify({ comp: '001', id: transaction.id }),
      }
    }).then(({ status, data, item, shipTo }) => {
      setIsLoading(false);

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
      setIsLoading(false);

      setCart(state => ({
        ...state,
        modelsLoaded: true
      }));
    });
  };

  const itemsToCart = (items: any[]): CartModel[] => {
    let priceTotal = 0;
    const cartItems = items.map((item): CartModel => {
      const subtotal = parseFloat(item.amount) || (parseFloat(item.qtyorder) * parseFloat(item.unitprice));
      priceTotal += subtotal;
 
      return {
        product: {
          prd_id: item.prdid,
          prd_no: item.prdno,
          prd_ds: item.prdds,
          prd_foto: item.foto || item.prdfoto || item.prd_foto,
        },
        qty: parseFloat(item.qtyorder),
        harga: subtotal,
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
        <View style={[wrapper.row, { alignItems: 'center', }]}>
          <FigmaIcon.FigmaShoppingBag width={24} height={24} color={colors.gray[900]} />

          <View style={{ flex: 1, marginRight: 15, marginLeft: 12 }}>
            <Typography>
              {t(`Belanja`)}
            </Typography>

            <Typography>
              {moment(transaction.ordertgl, 'YYYYMMDD').format('D MMMM YYYY')}
            </Typography>
          </View>

          <Typography
            heading
            size="sm"
            color={getStatusColor(status)}
            style={{ alignSelf: 'flex-end' }}
          >
            {getStatusText(status)}
          </Typography>
        </View>

        {!cartItem?.product ? null : (
          <View style={[styles.headerCart, { marginTop: 8 }]}>
            <View style={[wrapper.row]}>
              {!cartItemImage ? null : (
                <Image source={{ uri: cartItemImage }} style={styles.headerCartImage} />
              )}

              <View style={{ flex: 1, paddingTop: 4 }}>
                <View style={{ flex: 1 }}>
                  <Typography>
                    {cartItem.product?.prd_ds}
                  </Typography>

                  <Typography style={{ marginTop: 2 }}>
                    {`${cart_items?.length || 0} ${t(`Produk`)}`}
                  </Typography>
                </View>

                <View style={[wrapper.row, { marginTop: 'auto', paddingTop: 12 }]}>
                  <Typography style={{ flex: 1 }}>
                    {t(`Total Belanja`)}
                  </Typography>

                  <Typography heading>
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
            <Typography heading color={getStatusColor(status)}>
              {getStatusText(status)}
            </Typography>

            <Typography size="sm" style={{ marginTop: 4 }}>
              {`INV ${transaction.orderno}`}
            </Typography>
          </View>

          <View style={{ alignItems: 'flex-end' }}>
            {['proses', 'diterima'].indexOf(status || '') < 0 ? (
              <Ionicons name="chevron-down" size={16} color={colors.gray[900]} />
            ) : (
              <PressableBox
                containerStyle={{ alignSelf: 'flex-end' }}
                onPress={!onDetailPress ? null : () => onDetailPress(transaction)}
              >
                <Typography size="sm" style={{ borderBottomWidth: 1, borderColor: colors.gray[700] }}>
                  {t(`Lihat Detail`)}
                </Typography>
              </PressableBox>
            )}

            <Typography size="sm" style={{ marginTop: 4 }}>
              {moment(transaction.ordertgl, 'YYYYMMDD').format('D MMMM YYYY')}
            </Typography>
          </View>
        </View>

        {!cart_items?.length ? null : (
          <View style={[styles.headerCart, { marginTop: 8 }]}>
            <Typography heading>
              {t(`Detail Produk`)}
            </Typography>

            {cart_items?.map((item, index) => {
              const image = !item?.product?.images?.length ? item?.product?.prd_foto : item.product.images[0].prd_foto;

              return (
                <View key={index} style={[wrapper.row, { marginTop: 12 }]}>
                  {!image ? null : (
                    <Image source={{ uri: image }} style={styles.headerCartImage} />
                  )}

                  <View style={{ flex: 1, paddingTop: 2 }}>
                    <View style={{ flex: 1 }}>
                      <Typography>
                        {item.product?.prd_ds}
                      </Typography>

                      <Typography style={{ marginTop: 2 }}>
                        {`${item.qty || 0} ${t(`Barang`)}`}
                      </Typography>
                    </View>

                    <View style={[wrapper.row, { marginTop: 'auto', paddingTop: 8 }]}>
                      <Typography style={{ flex: 1 }}>
                        {t(`Subtotal`)}
                      </Typography>

                      <Typography heading>
                        {numeral(item.harga || 0).format()}
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

  const renderAction = () => {
    const buttons: ButtonProps[] = [];
    const infos: string[] = [];
    const transactionWithInfo = getTransactionWithInfo();

    switch (paymentMethod.method) {
      case 'transfer':
        switch (status) {
          case 'open':
            buttons.push({
              label: t(`Upload Bukti Bayar`).toUpperCase(),
              color: 'yellow',
              shadow: 3,
              onPress: 'function' !== typeof onPayPress ? undefined : () => onPayPress(transactionWithInfo),
            });
            break;
        }
        break;
      case 'cod':
        switch (status) {
          case 'open':
          case 'confirm':
          case 'do':
            infos.push(t(`Silahkan scan Barcode pada Driver yg mengantar pesanan Anda.`));

            buttons.push({
              label: t(`Bayar ke Driver`).toUpperCase(),
              color: 'yellow',
              shadow: 3,
              onPress: 'function' !== typeof onPayPress ? undefined : () => onPayPress(transactionWithInfo),
            });
            break;
        }
        break;
    }

    return (
      <View style={{ marginTop: 24 }}>
        {!infos.length ? null : (
          <View style={{ marginBottom: 16 }}>
            {infos.map((item, index) => (
              <Typography key={index} textAlign="center">{item}</Typography>
            ))}
          </View>
        )}

        {buttons.map((item, index) => (
          <Button
            key={index}
            containerStyle={{ marginTop: index === 0 ? 0 : 12, alignSelf: 'center' }}
            style={{ minWidth: 150 }}
            {...item}
          />
        ))}
      </View>
    )
  }

  const { models: cart_items } = cart;
  const status = transaction.orderstatus?.toLowerCase() as TransactionStatus;

  const cartItem = !cart_items?.length ? null : cart_items[0];
  const cartItemImage = !cartItem?.product?.images?.length ? cartItem?.product?.prd_foto : cartItem.product.images[0].prd_foto;

  const paymentMethod: PaymentMethodType = {
    nama: transaction.methodds,
    image: PAYMENT_IMAGES['1' === transaction.methodid ? 'Mandiri' : 'COD'],
    method: '1' === transaction.methodid ? 'transfer' : 'cod',
  };
  const transferInfo = PAYMENT_METHODS.find(item => item.method === paymentMethod.method);

  return (
    <View style={[styles.container, style]} {...props}>
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
          {isLoading ? (
            <View style={styles.contentSection}>
              <BoxLoading width={[120, 180]} height={20} />
              <BoxLoading width={[180, 280]} height={18} style={{ marginTop: 8 }} />
              <BoxLoading width={[180, 280]} height={18} style={{ marginTop: 4 }} />
              <BoxLoading width={[120, 160]} height={18} style={{ marginTop: 4 }} />
            </View>
          ) : (
            <>
              {!address ? null : (
                <View style={styles.contentSection}>
                  <Typography heading>
                    {t(`Info Pengiriman`)}
                  </Typography>

                  <View style={[wrapper.row, { marginTop: 6 }]}>
                    <Typography style={{ width: 140 }}>
                      {t(`Alamat`)}
                    </Typography>

                    <View style={{ flex: 1 }}>
                      {!address?.title ? null : (
                        <Typography heading>
                          {address?.title}
                        </Typography>
                      )}

                      <Typography heading style={{ marginTop: 4 }}>
                        {address?.vch_nama}
                      </Typography>

                      <Typography size="sm" style={{ marginTop: 4 }}>
                        {showPhone(address?.hp, '+62')}
                      </Typography>

                      <Typography size="sm" style={{ marginTop: 4 }}>
                        {address?.alamat}
                      </Typography>
                    </View>
                  </View>
                </View>
              )}

              {!paymentMethod ? null : (
                <View style={[styles.contentSection, { marginTop: 12 }]}>
                  <Typography heading>
                    {t(`Info Pembayaran`)}
                  </Typography>

                  <View style={[wrapper.row, { marginTop: 6 }]}>
                    <Typography style={{ width: 140 }}>
                      {t(`Metode Pembayaran`)}
                    </Typography>

                    <Typography style={{ flex: 1 }}>
                      {paymentMethod.nama}
                    </Typography>
                  </View>
                </View>
              )}

              {!transferInfo ? null : (
                <View style={[styles.contentSection, {
                  marginTop: 0,
                  paddingTop: 8,
                  borderTopWidth: 0
                }]}>
                  <Typography heading size="sm">
                    {t(`Transfer Menuju`)}
                  </Typography>

                  {([
                    { label: t(`Nama Bank`), key: 'bankName' },
                    { label: t(`No. Rekening`), key: 'bankNo' },
                    { label: t(`Atas Nama`), key: 'bankAccount' },
                  ]).map((item, index) => (
                    <View key={index} style={[wrapper.row, { marginTop: 4 }]}>
                      <Typography style={{ width: 140 }}>
                        {item.label}
                      </Typography>

                      {item.key !== 'bankNo' ? (
                        <Typography style={{ flex: 1 }} selectable>
                          {transferInfo[item.key as keyof typeof transferInfo]}
                        </Typography>
                      ) : (
                        <View style={[wrapper.row, { flex: 1, justifyContent: 'flex-start' }]}>
                          <Typography selectable>
                            {transferInfo.bankNo}
                          </Typography>

                          <Button
                            containerStyle={{ marginLeft: 2 }}
                            size={18}
                            onPress={() => {
                              const bankNo = transferInfo.bankNo;

                              Clipboard.setString(bankNo.replace(/-/g, ''));

                              ToastAndroid.show(`${''}Copied!`, ToastAndroid.SHORT);
                            }}
                          >
                            <Ionicons name="copy" size={14} color={colors.gray[800]} />
                          </Button>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              )}

              {!price.total ? null : (
                <View style={[styles.contentSection, { marginTop: 12 }]}>
                  <View style={[wrapper.row, { marginTop: 0 }]}>
                    <Typography style={{ width: 140 }}>
                      {`${t(`Total Harga`)}\n(${cart_items?.length} ${t(`Barang`, { count: cart_items?.length})})`}
                    </Typography>

                    <Typography style={{ flex: 1 }}>
                      {numeral(price.total).format()}
                    </Typography>
                  </View>

                  <View style={[wrapper.row, { marginTop: 6 }]}>
                    <Typography style={{ width: 140 }}>
                      {`${t(`Total Ongkos Kirim`)}`}
                    </Typography>

                    <Typography style={{ flex: 1 }}>
                      {!price.courier ? t(`Gratis`) : numeral(price.courier).format()}
                    </Typography>
                  </View>

                  <View style={[wrapper.row, { alignItems: 'flex-end', marginTop: 12 }]}>
                    <Typography heading style={{ width: 140 }}>
                      {`${t(`Total Bayar`)}`}
                    </Typography>

                    <Typography type="h5" style={{ flex: 1 }}>
                      {numeral(price.total + price.courier).format()}
                    </Typography>
                  </View>
                </View>
              )}

              {renderAction()}
            </>
          )}
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
