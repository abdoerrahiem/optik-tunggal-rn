import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, StyleSheet, ToastAndroid, View } from 'react-native';
import { useAppNavigation } from '../../router/RootNavigation';
import { Modelable, ProductModel, ReviewModel } from '../../types/model';
import { BottomDrawer, BottomDrawerProps, Button, RatingStars, TextField, Typography } from '../../ui-shared/components';
import { ErrorState, ValueOf } from '../../types/utilities';
import moment from 'moment';
import { colors, shadows, wrapper } from '../../lib/styles';
import { httpService } from '../../lib/utilities';
import { useAppSelector } from '../../redux/hooks';

type Props = BottomDrawerProps & {
  review?: ReviewModel;
  product?: ProductModel;
  editable?: boolean;
  onSuccess?: (model: ReviewModel) => void;
};

type Fields = Partial<ReviewModel> & {
  // 
};

function ReviewEditModal({
  isVisible,
  review: propReview,
  product: propProduct,
  onSuccess,
  editable = true,
  ...props
}: Props) {
  // Hooks
  const navigation = useAppNavigation();
  const { t } = useTranslation('notification');
  const { user: { user, location } } = useAppSelector(state => state);

  // States
  const [isSaving, setIsSaving] = useState(false);
  const [review, setReview] = useState<Modelable<ReviewModel>>({
    model: null,
    modelLoaded: false,
  });
  const [product, setProduct] = useState<Modelable<ProductModel>>({
    model: null,
    modelLoaded: false,
  });
  const [fields, setFields] = useState<Fields>({
    remark: '',
    star: 0,
  });
  const [error, setError] = useState<ErrorState<Fields>>({
    fields: [],
    message: undefined,
  });

  // Effects
  useEffect(() => {
    setIsSaving(false);

    setReview(state => ({
      ...state,
      model: propReview,
      modelLoaded: true,
    }));

    setFields(state => ({
      ...state,
      remark: '',
      star: 0,
      ...propReview,
    }));

    setError(state => ({
      ...state,
      fields: [],
      message: undefined,
    }));
  }, [propReview]);

  useEffect(() => {
    setProduct(state => ({
      ...state,
      model: propProduct,
      modelLoaded: true
    }));
  }, [propProduct]);

  // Vars
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

  const handleSubmit = async () => {
    if (!fields.star) {
      return handleErrorShow('star', t(`${''}Pilih bintang untuk menentukan skor produk`));
    } else if (!fields.remark) {
      return handleErrorShow('remark', t(`${''}Mohon tuliskan ulasan Anda untuk produk ini.`));
    }

    setIsSaving(true);

    return httpService('/product/save', {
      data: {
        act: 'Ulasan',
        comp: '001',
        dt: JSON.stringify({
          prdid: product.model?.prd_id,
          regid: user?.id,
          regds: user?.nama || `${user?.namadepan} ${user?.namabelakang}`,
          remark: fields.remark,
          star: fields.star,
          lat: location.lat,
          lng: location.lng,
          ip: location.ip,
        }),
      }
    }).then(({ status, data, ...rest }) => {
      setIsSaving(false);

      if (200 === status) {
        'function' === typeof onSuccess && onSuccess({
          remark: fields.remark,
          star: fields.star,
        });

        ToastAndroid.show(`${''}Terima kasih! Ulasan Anda telah disimpan.`, ToastAndroid.SHORT);
      }

    }).catch((err) => {
      setIsSaving(false);
    });
  };

  const { model: reviewModel } = review;
  const { model: productModel } = product;
  const image = !productModel?.images?.length ? productModel?.prd_foto : productModel.images[0].prd_foto;

  return (
    <BottomDrawer
      isVisible={isVisible}
      {...props}
    >
      <View style={styles.container}>
        <View style={styles.reviewBox}>
          {!image ? null : (
            <Image source={{ uri: image }} style={styles.reviewImage} />
          )}

          <View style={{ flex: 1 }}>
            {!reviewModel?.date ? null : (
              <Typography size="sm" style={{ marginBottom: 4 }}>
                {moment(reviewModel?.date).format('D MMM YYYY')}
              </Typography>
            )}

            <Typography>
              {productModel?.prd_ds}
            </Typography>

            <RatingStars
              style={{ alignSelf: 'flex-start', marginTop: 4 }}
              value={fields.star}
              size={28}
              editable={editable}
              onChange={(value) => handleFieldChange('star', value)}
            />

            {!getFieldError('star') ? null : (
              <Typography size="sm" color="red" style={{ marginTop: 6 }}>
                {error.message}
              </Typography>
            )}
          </View>
        </View>

        {!editable ? (
          <Typography style={[styles.reviewContent, { marginTop: 16 }]}>
            {reviewModel?.remark}
          </Typography>
        ) : (
          <View style={{ marginTop: 16 }}>
            <TextField
              containerStyle={{ paddingHorizontal: 8, ...shadows[3] }}
              style={{
                minHeight: 100,
                textAlignVertical: 'top',
                paddingVertical: 8,
              }}
              border={false}
              value={fields.remark}
              onChangeText={(value) => handleFieldChange('remark', value)}
              placeholder={t(`${''}Yuk, ceritain kepuasanmu tentang\nkualitas barang & pelayanan penjual`)}
              multiline
              error={!!getFieldError('remark')}
              message={error.message}
            />

            <Button
              containerStyle={{ marginTop: 16, alignSelf: 'center' }}
              style={{ minWidth: 150 }}
              label={t(`${''}Kirim Ulasan`)}
              color="yellow"
              onPress={handleSubmit}
              loading={isSaving}
            />
          </View>
        )}
      </View>
    </BottomDrawer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 12,
    paddingBottom: 24,
    paddingHorizontal: 15,
  },

  reviewBox: {
    ...wrapper.row,
    alignItems: 'center',
  },
  reviewImage: {
    width: 86,
    height: 86,
    borderRadius: 12,
    marginRight: 15,
  },
  reviewContent: {
    borderLeftWidth: 2,
    borderColor: colors.gray[400],
    paddingVertical: 8,
    paddingLeft: 8,
    marginLeft: 10,
  }
});

export default ReviewEditModal;
