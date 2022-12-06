import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, View, ViewProps } from 'react-native';
import { Button, ButtonProps, PressableBox, Typography } from '../../ui-shared/components';
import { colors, wrapper, shadows } from '../../lib/styles';
import * as Animatable from 'react-native-animatable';
import { AddressModel, CartModel, Modelable, PaymentMethodType, ProductModel, TransactionModel, TransactionStatus } from '../../types/model';
import { FigmaIcon } from '../../assets/icons';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import numeral from 'numeral';
import { getStatusColor, getStatusText, httpService } from '../../lib/utilities';
import { useAppNavigation } from '../../router/RootNavigation';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { PAYMENT_IMAGES } from '../pages/company/PaymentMethod';
import { BoxLoading } from '../../ui-shared/loadings';

type Props = ViewProps & {
  transaction: TransactionModel;
  onDetailPress?: (transaction: TransactionModel) => void;
  onPayPress?: (transaction: TransactionModel) => void;
  onInfoUpdate?: (transaction: TransactionModel) => void;
};

function TransactionItemNew({
  transaction,
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
  const [collapse, setCollapse] = useState<boolean>(false);
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
    // if (collapse && !cart.modelsLoaded) {
    //   retrieveInfo();
    // }
  }, [collapse]);

  // Vars
  const retrieveInfo = async () => {
    setIsLoading(true);

    return httpService('/api/transaction/transaction/', {
      data: {
        act: 'ListTransaksiUser',
        dt: JSON.stringify({ kdcust: usersModel.kd_customer }),
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
        borderColor: '#cccccc',
        borderRadius: 5, 
        borderWidth: 1,
      }}>
        <View style={[wrapper.row, { alignItems: 'center' }]}>
          <FigmaIcon.FigmaShoppingBag width={24} height={24} color={colors.gray[900]} />

          <View style={{ flex: 1, marginRight: 15, marginLeft: 12 }}>
            <Typography style={{ fontWeight: 'bold' }}>
              {t(`${transaction.orderno}`)}
            </Typography>
            <Typography>
              {numeral(transaction.totalbelanja || 0).format()}
            </Typography>
          </View>

          <View>
            <Typography style={{ textAlign: 'right' }}>
              {moment(transaction.ordertgl, 'YYYYMMDD').format('D MMMM YYYY')}
            </Typography>
            <Typography
              heading
              size="sm"
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
                  <Typography>
                    {cartItem.product?.prd_ds}
                  </Typography>

                  <Typography style={{ marginTop: 2 }}>
                    {`${cart_items?.length || 0} ${t(`${''}Produk`)}`}
                  </Typography>
                </View>

                <View style={[wrapper.row, { marginTop: 'auto', paddingTop: 12 }]}>
                  <Typography style={{ flex: 1 }}>
                    {t(`${''}Total Belanja`)}
                  </Typography>

                  <Typography heading>
                    {numeral(transaction.totalbelanja || 0).format()}
                  </Typography>
                </View>
              </View>
            </View>
            <View>
              <Typography style={{ flex: 1, marginTop: 10, textAlign: 'center', backgroundColor: '#f1f1f1', borderRadius: 3, paddingVertical: 5 }} color={colors.gray[800]}>
                {t(`${''}Lihat Detail`)}
              </Typography>
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

            <Typography size="md" style={{ marginTop: 4 }}>
              {`No. Transaksi : ${transaction.orderno}`}
            </Typography>
            <Typography style={{ fontWeight: 'bold' }}>
              {t(`Rp. ${transaction.totalbelanja}`)}
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
                  {t(`${''}Lihat Detail`)}
                </Typography>
              </PressableBox>
            )}

            <Typography size="sm" style={{ marginTop: 4 }}>
              {moment(transaction.ordertgl, 'YYYYMMDD').format('D MMMM YYYY')}
            </Typography>
          </View>
        </View>

      </View>
    );
  };

  // const detailTransaksi = (transaksi: TransactionModel) => {
  //   navigation.navigatePath('Public', {
  //     screen: 'BottomTabs.NotificationStack.TransactionDetail',
  //     params: [null, null, {
  //       transaction_id: transaksi.id,
  //       transaksi: transaksi
  //     }],
  //   });
  // }

  const renderAction = () => {
    const buttons: ButtonProps[] = [];
    const infos: string[] = [];
    const transactionWithInfo = getTransactionWithInfo();

    switch (paymentMethod.method) {
      case 'transfer':
        switch (status) {
          case 'open':
            buttons.push({
              label: `${''}Upload Bukti Bayar`.toUpperCase(),
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
            infos.push(`${''}Silahkan scan Barcode pada Driver yg mengantar pesanan Anda.`);

            buttons.push({
              label: `${''}Bayar ke Driver`.toUpperCase(),
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

  return (
    <View style={[styles.container, style]} {...props}>
      <PressableBox
        containerStyle={{ marginHorizontal: 0, overflow: 'visible' }}
        style={{ paddingHorizontal: 0 }}
        onPress={() => navigation.navigatePath('Public', {
          screen: 'BottomTabs.NotificationStack.TransactionDetail',
          params: [null, null, {
            transaction_id: transaction.id,
            nomororder: transaction.orderno,
            transaksi: transaction
          }],
        })}
      >
        {renderHeaderShrink()}
        {/*!collapse ? renderHeaderShrink() : renderHeaderExpand()*/}
      </PressableBox>

      {/*<Animatable.View
        style={[
          styles.contentWrapper,
          { height: !collapse ? 0 : contentHi },
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
                    {t(`${''}Info Pengiriman`)}
                  </Typography>

                  <View style={[wrapper.row, { marginTop: 6 }]}>
                    <Typography style={{ width: 140 }}>
                      {t(`${''}Alamat`)}
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
                        {address?.hp}
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
                    {t(`${''}Info Pembayaran`)}
                  </Typography>

                  <View style={[wrapper.row, { marginTop: 6 }]}>
                    <Typography style={{ width: 140, flex: 2 }}>
                      {t(`${''}Metode Pembayaran`)}
                    </Typography>

                    <Typography style={{ flex: 1, textAlign: 'right' }}>
                      {paymentMethod.nama}
                    </Typography>
                  </View>
                </View>
              )}

              {!price.total ? null : (
                <View style={[styles.contentSection, { marginTop: 12 }]}>
                  <View style={[wrapper.row, { marginTop: 0 }]}>
                    <Typography style={{ width: 140, flex: 2 }}>
                      {`${t(`${''}Total Harga`)}\n(${cart_items?.length} ${t(`${''}Barang)`)}`}
                    </Typography>

                    <Typography style={{ flex: 1, textAlign: 'right' }}>
                      {numeral(price.total).format()}
                    </Typography>
                  </View>

                  <View style={[wrapper.row, { marginTop: 6 }]}>
                    <Typography style={{ width: 140, flex: 2 }}>
                      {`${t(`${''}Total Ongkos Kirim`)}`}
                    </Typography>

                    <Typography style={{ flex: 1, textAlign: 'right' }}>
                      {!price.courier ? t(`${''}Gratis`) : numeral(price.courier).format()}
                    </Typography>
                  </View>

                  <View style={[wrapper.row, { alignItems: 'flex-end', marginTop: 12 }]}>
                    <Typography heading style={{ width: 140, flex: 2 }}>
                      {`${t(`${''}Total Bayar`)}`}
                    </Typography>

                    <Typography type="h5" style={{ flex: 1, textAlign: 'right' }}>
                      {numeral(price.total + price.courier).format()}
                    </Typography>
                  </View>
                </View>
              )}

              {renderAction()}
            </>
          )}
        </View>
      </Animatable.View>*/}
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
    width: 50,
    height: 50,
    borderRadius: 10,
    marginRight: 12,
    resizeMode: 'stretch',
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

export default TransactionItemNew;
