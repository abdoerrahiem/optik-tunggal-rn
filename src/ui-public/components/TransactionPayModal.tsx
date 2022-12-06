import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Linking, Platform, Pressable, StyleSheet, ToastAndroid, useWindowDimensions, View } from 'react-native';
import { useAppNavigation } from '../../router/RootNavigation';
import { Modelable, TransactionModel } from '../../types/model';
import { BottomDrawer, BottomDrawerProps, Button, PressableBox, TextField, Typography } from '../../ui-shared/components';
import { ErrorState, ValueOf } from '../../types/utilities';
import DocumentPicker from 'react-native-document-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../../lib/styles';
import { launchCamera } from 'react-native-image-picker';
import RNFS from 'react-native-fs'
import { useAppSelector } from '../../redux/hooks';
import { httpService } from '../../lib/utilities';
import { BannerWelcome } from '../../assets/images/banners';

type Props = BottomDrawerProps & {
  transaction?: TransactionModel;
  onSuccess?: () => void;
};

type Fields = {
  foto?: string;
  namafoto?: string;
  fotoLocalName?: string;
};

function TransactionPayModal({
  isVisible,
  transaction: model,
  onSuccess,
  ...props
}: Props) {
  // Hooks
  const navigation = useAppNavigation();
  const { width, height } = useWindowDimensions();
  const { t } = useTranslation('notification');
  const { user: { user, location } } = useAppSelector(state => state);

  // States
  const [isFinish, setIsFinish] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [transaction, setTransaction] = useState<Modelable<TransactionModel>>({
    model: null,
    modelLoaded: false,
  });
  const [fields, setFields] = useState<Fields>({
    foto: '',
    namafoto: '',
    fotoLocalName: '',
  });
  const [error, setError] = useState<ErrorState<Fields>>({
    fields: [],
    message: undefined,
  });
  const [options, setOptions] = useState({
    infoModalOpen: false,
  });

  // Effects
  useEffect(() => {
    setIsFinish(false);
    setIsSaving(false);

    handleModalToggle('info', false);

    setTransaction(state => ({
      ...state,
      model,
      modelLoaded: true,
    }));

    setFields(state => ({
      ...state,
      foto: '',
      namafoto: '',
      fotoLocalName: '',
    }));

    setError(state => ({
      ...state,
      fields: [],
      message: undefined,
    }));

    if (!model?.invoice_url) {
      retrieveInvoiceUrl();
    }
  }, [model]);

  // Vars
  const retrieveInvoiceUrl = async () => {
    setTransaction(state => ({
      ...state,
      modelLoaded: false,
    }));

    return new Promise(resolve => {
      setTimeout(() => {
        setTransaction(state => ({
          ...state,
          model: {
            ...state.model,
            invoice_url: `https://websetia.com/hasilkaninvoice/moritainvoice.php?idorder=${transaction.model?.id}`
          },
          modelLoaded: true,
        }));
      }, 1000);

      resolve(null);
    });
  };

  const handleModalToggle = async (type: string, open: boolean | null = null) => {
    switch (type) {
      case 'info':
        const toggle = 'boolean' === typeof open ? open : !options.infoModalOpen;

        setOptions(state => ({
          ...state,
          infoModalOpen: toggle
        }));

        (!toggle && isFinish && 'function' === typeof onSuccess) && onSuccess();
        break;
    }
  };

  const handleFieldChange = (field: keyof Fields, value: ValueOf<Fields>) => {
    const { fields = [] } = error;

    setFields(state => ({
      ...state,
      [field]: value
    }));

    fields.indexOf(field) >= 0 && setError({
      fields: [],
      message: undefined,
    });
  };

  const handleErrorShow = (fields: keyof Fields | Array<keyof Fields>, message: string) => {
    ToastAndroid.show(message, ToastAndroid.SHORT);

    setError({
      fields: 'string' === typeof fields ? [fields] : fields as Array<keyof Fields>,
      message
    });
  };

  const getFieldError = (field: keyof Fields) => {
    const { fields = [] } = error;

    return fields.indexOf(field) < 0 ? null : error.message;
  };

  const handleSubmit = () => {
    if (!fields.namafoto) {
      return handleErrorShow('namafoto', t('Mohon pilih foto bukti pembayaran.'));
    }

    setIsSaving(true);

    return httpService('/order/save', {
      data: {
        act: 'MPPaidConfirm',
        comp: '001',
        dt: JSON.stringify({
          regid: user?.id,
          id: transaction.model?.id,
          namafoto: fields.namafoto,
          remark: '',
          lat: location.lat,
          lng: location.lng,
          ip: location.ip,
        }),
        foto: fields.foto,
      }
    }).then(({ status, data, ...rest }) => {
      setIsSaving(false);

      if (200 === status) {
        setIsFinish(true);

        handleModalToggle('info', true);
      }
    }).catch((...rest) => {
      setIsSaving(false);
    })
  };

  const handleCameraOpen = async (field: keyof Fields) => {
    const { assets = [] } = await launchCamera({
      mediaType: 'photo',
      maxWidth: 1920,
      maxHeight: 1920,
    }).catch(() => ({ assets: [] }));

    const [file] = assets;

    if (file) {
      const fileNames = file.fileName?.split('.') || [];
      const fileExt = fileNames[fileNames.length - 1];
      const fieldValue = moment().format('YYYYMMDD') + "_" + moment().unix() + "." + fileExt;
      const filePath = Platform.OS === 'android' ? file.uri : file.uri?.replace('file://', '');
      let attachmentKey = '';

      switch (field) {
        case 'namafoto':
          attachmentKey = 'foto';
          handleFieldChange('fotoLocalName', `Camera_${fieldValue}`);
          break;
      }

      (attachmentKey && filePath) && await RNFS.readFile(filePath, 'base64').then((value) => {
        const fileBase64 = `data:${file.type};base64,${value}`;

        handleFieldChange(attachmentKey as keyof Fields, fileBase64);
      });

      handleFieldChange(field, fieldValue);
    }
  };

  const handleFileOpen = async (field: keyof Fields) => {
    const [file] = await DocumentPicker.pick({
      type: [DocumentPicker.types.allFiles],
    }).catch(() => []);

    if (file) {
      const fileNames = file.name?.split('.') || [];
      const fileExt = fileNames[fileNames.length - 1];
      const fieldValue = moment().format('YYYYMMDD') + "_" + moment().unix() + "." + fileExt;
      const filePath = Platform.OS === 'android' ? file.uri : file.uri.replace('file://', '');
      let attachmentKey = '';

      switch (field) {
        case 'namafoto':
          attachmentKey = 'foto';
          handleFieldChange('fotoLocalName', file.name);
          break;
      }

      attachmentKey && await RNFS.readFile(filePath, 'base64').then((value) => {
        const fileBase64 = `data:${file.type};base64,${value}`;

        handleFieldChange(attachmentKey as keyof Fields, fileBase64);
      });

      handleFieldChange(field, fieldValue);
    }
  };

  const renderPaymentDialog = () => {
    const { payment_method } = transaction.model || {};

    switch (payment_method?.method) {
      case 'transfer':
        return renderTransferDialog();
      case 'cod':
        return renderCodDialog();
    }

    return null;
  };

  const renderTransferDialog = () => {
    return (
      <View>
        <Typography type="h4" color="primary" textAlign="center">
          {t(`${''}Pesanan Kamu`)}
        </Typography>

        <Typography style={{ marginTop: 6 }}>
          {t(`${''}Kirim bukti pembayaran dengan cara upload foto bukti transfer atau bukti pembayaran untuk transaksi ini.`)}
        </Typography>

        <View style={styles.actionContainer}>
          <Image
            source={require('../../assets/images/banners/download-invoice.png')}
            style={styles.actionBg}
          />

          <View style={styles.actionContent}>
            <Typography>
              {t(`${''}Nomor Invoice Pesanan Kamu Adalah :`)}
            </Typography>

            <Typography type="h5" color="primary" style={{ marginTop: 6 }}>
              {`INV ${transaction.model?.orderno}`}
            </Typography>

            <PressableBox
              containerStyle={{
                overflow: 'visible',
                alignSelf: 'stretch',
                marginTop: 12,
                marginHorizontal: 15,
              }}
              opacity={1}
              onPress={() => handleFileOpen('namafoto')}
            >
              <TextField
                placeholder="Pilih Foto/Gambar"
                border
                value={fields.fotoLocalName}
                editable={false}
                pointerEvents="none"
                left={(
                  <Ionicons name="image" size={20} color={colors.gray[700]} />
                )}
                right={(
                  <Button
                    containerStyle={{ marginRight: -4 }}
                    size={32}
                    onPress={() => handleCameraOpen('namafoto')}
                  >
                    <Ionicons name="camera-outline" size={24} color={colors.gray[700]} />
                  </Button>
                )}
                error={!!getFieldError('namafoto')}
                message={error.message}
              />
            </PressableBox>

            <Button
              containerStyle={{ marginTop: 16 }}
              style={{ minWidth: 150 }}
              label={t(`${''}Kirim Bukti Bayar`).toUpperCase()}
              color="yellow"
              shadow={3}
              onPress={handleSubmit}
              loading={isSaving}
              disabled={isFinish}
            />
          </View>
        </View>
      </View>
    );
  };

  const renderCodDialog = () => {
    return (
      <View>
        <Typography type="h4" color="primary" textAlign="center">
          {t(`${''}Pesanan Kamu`)}
        </Typography>

        <Typography style={{ marginTop: 6 }}>
          {t(`${''}Berikut nomor invoice pesanan kamu! Mohon tunjukan ke driver motor/mobil Getall yang datang.`)}
        </Typography>

        <View style={styles.actionContainer}>
          <Image
            source={require('../../assets/images/banners/download-invoice.png')}
            style={styles.actionBg}
          />

          <View style={styles.actionContent}>
            <Typography>
              {t(`${''}Nomor Invoice Pesanan Kamu Adalah :`)}
            </Typography>

            <Typography type="h5" color="primary" style={{ marginTop: 6 }}>
              {`INV ${transaction.model?.orderno}`}
            </Typography>

            <Button
              containerStyle={{ marginTop: 12 }}
              style={{ minWidth: 150 }}
              label={t(`${''}Download Pdf`).toUpperCase()}
              color="yellow"
              shadow={3}
              onPress={!invoice_url ? undefined : () => Linking.openURL(invoice_url)}
              loading={isSaving}
              disabled={isFinish}
            />
          </View>
        </View>
      </View>
    );
  };

  const { invoice_url, payment_method } = transaction.model || {};
  const paymentMethodType = payment_method?.method;

  return (
    <>
      <BottomDrawer
        isVisible={isVisible}
        // title={t(`${''}Pembayaran`)}
        // titleProps={{ textAlign: 'center', color: 'primary' }}
        {...props}
      >
        <View style={styles.container}>
          {renderPaymentDialog()}
        </View>
      </BottomDrawer>

      {/* Popup Finish */}
      <BottomDrawer
        isVisible={options.infoModalOpen}
        swipeDirection={null}
        onBackButtonPress={() => handleModalToggle('info', false)}
        onBackdropPress={() => handleModalToggle('info', false)}
        containerStyle={{
          borderTopLeftRadius: 0,
          height: height,
        }}
        style={{
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          height: height,
          paddingTop: 0,
        }}
      >
        <PressableBox
          containerStyle={{
            marginHorizontal: 0,
            flex: 1,
          }}
          style={{
            paddingHorizontal: 15,
            flexDirection: 'column',
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          opacity={1}
          onPress={() => handleModalToggle('info', false)}
        >
          <BannerWelcome width={width * 0.7} height={width * 0.7} />

          <Typography type="h4" color="primary" textAlign="center" style={{ marginTop: 12 }}>
            {'transfer' === paymentMethodType ? (
              `${''}Pembayaran Diverifikasi`.toUpperCase()
            ) : (
              `${''}Pesanan COD Berhasil`
            )}
          </Typography>

          <Typography type="h6" color="primary" textAlign="center" style={{ marginTop: 4 }}>
            {'transfer' === paymentMethodType ? (
              `${''}Terimakasih! Barang akan segera dikirim ke rumahmu!`
            ) : (
              `${''}Terimakasih! Barang akan segera dikirim ke rumahmu!`
            )}
          </Typography>
        </PressableBox>
      </BottomDrawer>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 12,
    paddingBottom: 15,
    paddingHorizontal: 15,
    flexDirection: 'column-reverse'
  },

  actionContainer: {
    marginHorizontal: -15,
    marginVertical: 12,
    minHeight: 180,
    position: 'relative',
    justifyContent: 'center',
  },
  actionBg: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  actionContent: {
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 32,
  }
});

export default TransactionPayModal;
