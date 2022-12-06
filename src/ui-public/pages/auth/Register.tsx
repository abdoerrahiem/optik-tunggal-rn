import { useRoute } from '@react-navigation/core';
import React, { useEffect, useState } from 'react';
import { Platform, RefreshControl, ScrollView, StyleSheet, ToastAndroid, useWindowDimensions, View, Alert, Image, useColorScheme } from 'react-native';
import { colors, wrapper } from '../../../lib/styles';
import { useAppNavigation } from '../../../router/RootNavigation';
import { ErrorState, ValueOf } from '../../../types/utilities';
import { httpService } from '../../../lib/utilities';
import { Button, PressableBox, TextField, Typography } from '../../../ui-shared/components';
import validator from 'validator';
import DocumentPicker, { DocumentPickerResponse } from 'react-native-document-picker';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import RNFS from 'react-native-fs';
import { launchCamera } from 'react-native-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { showPhone } from '../../../lib/utilities';

type Fields = {
  namadepan?: string,
  namabelakang?: string,
  hp?: string,
  email?: string,
  ktpLocalName?: string,
  ktp?: string,
  namaktp?: string,
  fotoLocalName?: string,
  foto?: string,
  namafoto?: string,
  gender?: string,
  // password?: string,
};

function Register() {
  // Hooks
  const navigation = useAppNavigation();
  const route = useRoute();
  const { width } = useWindowDimensions();
  const { t } = useTranslation('notification');

  // const [tabIndex, setTabIndex] = React.useState();
  // const handleTabsChange = index => {
  //   setTabIndex(index);
  //   console.log('Current state unit: ', setTabIndex(index));
  // };
  const [isSaving, setIsSaving] = useState(false);
  // States
  const [isLoading, setIsLoading] = useState(false);
  const [fields, setFields] = useState<Fields>({
    namadepan: '',
    namabelakang: '',
    hp: '',
    email: '',
    namaktp: '',
    namafoto: '',
    gender: '',
  });
  const [options, setOptions] = useState({
    ktpFileUploading: false,
    pictureFileUploading: false,
  });
  const [error, setError] = useState<ErrorState<Fields>>({
    fields: [],
    message: undefined,
  });

  // Effects
  useEffect(() => {
    // 
  }, []);

  // const getdataExist = async () => {
  //   return httpService('/api/login/login', {
  //     data: {
  //       act: 'CekEmailExist',
  //       dt: JSON.stringify({
  //         email: 'nrntwhd@gmail.com',
  //         hp: '0812563400463',
  //       }),
  //     }
  //   }).then(({ status, data }) => {
  //     setIsSaving(false);
  //     if (status === 201) {
  //       Alert.alert( "Pemberitahuan", "Email atau No. Handphone sudah terdaftar. "+data.kd_customer,
  //         [
  //           { text: "OK", onPress: () => console.log("OK Pressed") }
  //         ]
  //       );
  //     }else{

  //     }
  //   }).catch((err) => {
  //     setIsSaving(false);
  //   });
    
  // };

  // Vars
  const handleFieldChange = (field: keyof Fields, value: ValueOf<Fields>) => {
    const { fields = [] } = error;

    if (field === 'hp' && value?.indexOf('0') === 0) {
      value = value.slice(1);
    }

    setFields(state => ({
      ...state,
      [field]: value,
    }));

    fields.indexOf(field) >= 0 && setError({
      fields: [],
      message: undefined,
    });
  };

  const kirimPassword = async () => {
    return httpService('/api/login/login', {
      data: {
        act: 'KirimPasswordUserTerdaftar',
        dt: JSON.stringify({
          email: fields.email,
          nama: fields.namadepan+' '+fields.namabelakang,
          hp: fields.hp
        }),
      }
    }).then(({ status, data }) => {
      setIsSaving(false);
      if (status === 200) {
        Alert.alert( "Alert", "Password sudah kami kirim ke email anda.",
          [
            { text: "OK", onPress: () => { navigation.navigatePath('Public', { screen: 'BottomTabs.AccountStack.Login',}); }}
          ]
        );
      }
    }).catch((err) => {
      setIsSaving(false);
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
    // console.log('GENDER__'+tabIndex);
    if (!fields.namadepan || !fields.namabelakang) {
      return handleErrorShow('namadepan', t('Enter First Name and Last Name.'));
    } else if (!fields.hp) {
      return handleErrorShow('hp', t('Enter Mobile Number.'));
    } else if (!fields.email) {
      return handleErrorShow('email', t('Enter email address.'));
    } else if (!validator.isEmail(fields.email)) {
      return handleErrorShow('email', t('Enter email address.'));
    } /*else if (!fields.foto) {
      return handleErrorShow('namafoto', t('Please select the file for your profile photo.'));
    } else if (!fields.ktp) {
      return handleErrorShow('namaktp', t('Please select your KTP/NPWP photo file.'));
    }*/

    return httpService('/api/login/login', {
      data: {
        act: 'CekEmailExist',
        dt: JSON.stringify({
          email: fields.email,
          hp: fields.hp,
        }),
      }
    }).then(({ status, data }) => {
      setIsSaving(false);
      if (status === 200) {
        Alert.alert( "Alert", "Looks like you've done transactions at OPTIK TUNGGAL. Please click the request password button to access these apps and you don't need to register a new account. Thank you",
          [
            { text: "Request Password", onPress: () => kirimPassword() }
          ]
        );
      }else if(status === 201){
        navigation.navigatePath('Public', {
          screen: 'BottomTabs.AccountStack.AddressEdit',
          params: [null, null, {
            profile: {
              ...fields,
              // hp: `62${fields.hp}`,
              hp: showPhone(fields.hp, '62'),
            },
          }],
        });
      }
    }).catch((err) => {
      setIsSaving(false);
    });
  };

  // const handleCameraOpen = async (field: keyof Fields) => {
  //   const { assets = [] } = await launchCamera({
  //     mediaType: 'photo',
  //     maxWidth: 1920,
  //     maxHeight: 1920,
  //   }).catch(() => ({ assets: [] }));

  //   const [file] = assets;

  //   if (file) {
  //     const fileNames = file.fileName?.split('.') || [];
  //     const fileExt = fileNames[fileNames.length - 1];
  //     const fieldValue = moment().format('YYYYMMDD') + "_" + moment().unix() + "." + fileExt;
  //     const filePath = Platform.OS === 'android' ? file.uri : file.uri?.replace('file://', '');
  //     let attachmentKey = '';

  //     switch (field) {
  //       case 'namaktp':
  //         attachmentKey = 'ktp';
  //         handleFieldChange('ktpLocalName', `Camera_${fieldValue}`);
  //         break;
  //       case 'namafoto':
  //         attachmentKey = 'foto';
  //         handleFieldChange('fotoLocalName', `Camera_${fieldValue}`);
  //         break;
  //     }

  //     (attachmentKey && filePath) && await RNFS.readFile(filePath, 'base64').then((value) => {
  //       const fileBase64 = `data:${file.type};base64,${value}`;

  //       handleFieldChange(attachmentKey as keyof Fields, fileBase64);
  //     });

  //     handleFieldChange(field, fieldValue);
  //   }
  // };

  // const handleFileOpen = async (field: keyof Fields) => {
  //   const [file] = await DocumentPicker.pick({
  //     type: [DocumentPicker.types.allFiles],
  //   }).catch(() => []);

  //   if (file) {
  //     const fileNames = file.name?.split('.') || [];
  //     const fileExt = fileNames[fileNames.length - 1];
  //     const fieldValue = moment().format('YYYYMMDD') + "_" + moment().unix() + "." + fileExt;
  //     const filePath = Platform.OS === 'android' ? file.uri : file.uri.replace('file://', '');
  //     let attachmentKey = '';

  //     switch (field) {
  //       case 'namaktp':
  //         attachmentKey = 'ktp';
  //         handleFieldChange('ktpLocalName', file.name);
  //         break;
  //       case 'namafoto':
  //         attachmentKey = 'foto';
  //         handleFieldChange('fotoLocalName', file.name);
  //         break;
  //     }

  //     attachmentKey && await RNFS.readFile(filePath, 'base64').then((value) => {
  //       const fileBase64 = `data:${file.type};base64,${value}`;

  //       handleFieldChange(attachmentKey as keyof Fields, fileBase64);
  //     });

  //     handleFieldChange(field, fieldValue);
  //   }
  // };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: 'http://www.resindaparkmall.com/media/k2/items/cache/ba1b7eb9b8ad142948e3b9dce300b4c6_L.jpg'}} style={{ width: '60%', height: 75, alignSelf: 'center' }}/>
      {/*<Typography style={{ textAlign: 'center', marginTop: 10 }}>
        Please fill in your personal data.
      </Typography>*/}
      <TextField
        containerStyle={{ marginTop: 25 }}
        placeholder={t('First Name')}
        value={fields.namadepan}
        onChangeText={(value) => handleFieldChange('namadepan', value)}
        error={!!getFieldError('namadepan')}
        message={error.message}
      />

      <TextField
        containerStyle={{ marginTop: 12 }}
        placeholder={t('Last Name')}
        value={fields.namabelakang}
        onChangeText={(value) => handleFieldChange('namabelakang', value)}
        error={!!getFieldError('namabelakang')}
        message={error.message}
      />

      {/*<View style={{ marginTop: 30 }}>
        <Typography style={{ marginBottom: 10, fontWeight: 'bold' }}>Jenis Kelamin</Typography>
        <SegmentedControl
          tabs={['Laki-laki', 'Wanita']}
          currentIndex={tabIndex}
          onChange={handleTabsChange}
          segmentedControlBackgroundColor='#CCCCCC'
          activeSegmentBackgroundColor='#FEFEFE'
          activeTextColor='black'
          textColor='#9e9e9e'
          paddingVertical={6}
        />
      </View>*/}

      <TextField
        containerStyle={{ marginTop: 20 }}
        placeholder={t('contoh : 8123456789')}
        value={fields.hp}
        onChangeText={(value) => handleFieldChange('hp', value)}
        keyboardType="phone-pad"
        left={(
          <View style={{ ...wrapper.row, alignItems: 'center' }}>
            <Typography color={950} style={{ marginLeft: 6 }}>+62</Typography>
          </View>
        )}
        error={!!getFieldError('hp')}
        message={error.message}
      />

      <TextField
        containerStyle={{ marginTop: 12 }}
        placeholder={t('Email')}
        value={fields.email}
        onChangeText={(value) => handleFieldChange('email', value)}
        keyboardType="email-address"
        autoCapitalize="none"
        error={!!getFieldError('email')}
        message={error.message}
      />
      
      {/*
      <PressableBox
        containerStyle={{ overflow: 'visible' }}
        opacity={1}
        onPress={() => handleFileOpen('namaktp')}
      >
        <TextField
          containerStyle={{ flex: 1, marginTop: 12 }}
          placeholder={t('Upload KTP or NPWP')}
          value={fields.ktpLocalName}
          editable={false}
          pointerEvents="none"
          right={(
            <Button
              size={32}
              onPress={() => handleCameraOpen('namaktp')}
            >
              <Ionicons name="camera-outline" size={24} color={colors.gray[700]} />
            </Button>
          )}
          error={!!getFieldError('namaktp')}
          message={error.message}
        />
      </PressableBox>

      <PressableBox
        containerStyle={{ overflow: 'visible' }}
        opacity={1}
        onPress={() => handleFileOpen('namafoto')}
      >
        <TextField
          containerStyle={{ marginTop: 12 }}
          placeholder={t('Upload Photo')}
          value={fields.fotoLocalName}
          editable={false}
          pointerEvents="none"
          right={(
            <Button
              size={32}
              onPress={() => handleCameraOpen('namafoto')}
            >
              <Ionicons name="camera-outline" size={24} color={colors.gray[700]} />
            </Button>
          )}
          error={!!getFieldError('namafoto')}
          message={error.message}
        />
      </PressableBox>*/}

      <View style={{ marginTop: 30, paddingTop: 24 }}>
        <Button
          containerStyle={{ alignSelf: 'center', borderRadius: 5, backgroundColor: '#CCC', }}
          style={{ width: 360, height: 40,  }}
          label={t('Submit').toUpperCase()}
          shadow={3}
          onPress={handleSubmit}
        />
        {/*Typography style={{ textAlign: 'center', marginTop: 20 }}>
          - OR -
        </Typography>
        <PressableBox
          containerStyle={{ alignSelf: 'center', marginTop: 20, 
                            backgroundColor: '#df5449', borderColor: '#ccc', 
                            borderWidth: 1, borderRadius: 5, overflow: 'visible' }}
          style={{ width: 360, height: 40, }}
          opacity={1}
          onPress={() => Alert.alert( "Halo", "Fitur Google ini sedang dikembangkan!",
                                      [{text: "Cancel",onPress: () => console.log("Cancel Pressed"),style: "cancel"},
                                        { text: "OK", onPress: () => console.log("OK Pressed") }
                                      ]
                        )}>
          <Typography style={{ textAlign: 'center', marginTop: 10, color: 'white' }}>
            <Ionicons name="logo-google" size={15} />
            oogle
          </Typography>
        </PressableBox>
        <PressableBox
          containerStyle={{ alignSelf: 'center', marginTop: 20, 
                            backgroundColor: '#4867aa', borderColor: '#ccc', 
                            borderWidth: 1, borderRadius: 5, overflow: 'visible' }}
          style={{ width: 360, height: 40, }}
          opacity={1}
          onPress={() => Alert.alert( "Halo", "Fitur Facebook ini sedang dikembangkan!",
                                      [{text: "Cancel",onPress: () => console.log("Cancel Pressed"),style: "cancel"},
                                        { text: "OK", onPress: () => console.log("OK Pressed") }
                                      ]
                        )}>
          <Typography style={{ textAlign: 'center', marginTop: 10, color: 'white' }}>
            <Ionicons name="logo-facebook" size={15} style={{color: 'white'}} />          
            acebook
          </Typography>
        </PressableBox>*/}
      </View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 15,
    paddingBottom: 24,
    backgroundColor: colors.white,
  },
});

export type { Fields as RegisterFields };

export default Register;
