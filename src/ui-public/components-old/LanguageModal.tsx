import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { colors } from '../../lib/styles';
import { Storage } from '../../lib/utilities';
import { setUiLang } from '../../redux/reducers/uiReducer';
import { BottomDrawer, BottomDrawerProps, Button, Typography } from '../../ui-shared/components';

type Props = BottomDrawerProps & {
  onSelected?: () => void;
};

function LanguageModal({
  isVisible,
  onSelected,
  ...props
}: Props) {
  // Hooks
  const { t, i18n } = useTranslation('account');
  const dispatch = useDispatch();

  // Effects
  useEffect(() => {

  }, [isVisible]);

  // Vars
  const handleLangChange = async (lang: string) => {
    await i18n.changeLanguage(lang);

    await Storage.storeData('lang', lang);

    dispatch(setUiLang(lang));

    'function' === typeof onSelected && onSelected();
  };

  const currentLang = i18n.language;

  return (
    <BottomDrawer
      isVisible={isVisible}
      title={t('Ganti Bahasa')}
      {...props}
    >
      <View style={styles.container}>
        {[
          { label: "Bahasa Indonesia", value: "id" },
          { label: "English", value: "en" },
        ].map((item, index) => {
          const selected = currentLang === item.value;
          
          return (
            <Button
              key={index}
              label={item.label}
              labelProps={{ type: 'p' }}
              containerStyle={{
                marginTop: index > 0 ? 4 : 0,
                backgroundColor: currentLang === item.value ? colors.transparent('palettes.primary', 0.1) : undefined,
              }}
              style={{ justifyContent: 'space-between' }}
              onPress={() => handleLangChange(item.value)}
              size="lg"
              right={(
                <Typography size="sm" color={selected ? 'blue' : 'primary'}>
                  {item.value.toUpperCase()}
                </Typography>
              )}
            />
          );
        })}
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
});

export default LanguageModal;
