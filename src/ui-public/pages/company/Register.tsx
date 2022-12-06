import { useRoute } from '@react-navigation/core';
import React, { useEffect, useState, useRef } from 'react';
import { Platform, TouchableOpacity, ScrollView, StyleSheet, ToastAndroid, 
         useWindowDimensions, View, Alert, Image, useColorScheme } from 'react-native';
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
import PhoneInput from "react-native-phone-number-input";
import { Colors } from "react-native/Libraries/NewAppScreen";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import SelectDropdown from 'react-native-select-dropdown';

type Fields = {
  namadepan?: string,
  namatengah?: string,
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
  tgllahir?: string,
  // password?: string,
};

function Register() {
  // Hooks
  const navigation = useAppNavigation();
  const route = useRoute();
  const { width } = useWindowDimensions();
  const { t } = useTranslation('notification');
  const phoneInput = useRef<PhoneInput>(null);
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  // const [tabIndex, setTabIndex] = React.useState();
  // const handleTabsChange = index => {
  //   setTabIndex(index);
  //   console.log('Current state unit: ', setTabIndex(index));
  // };
  const genderData = ['Pria', 'Wanita'];
  const [gender, setGender] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  // States
  const [isLoading, setIsLoading] = useState(false);
  const [fields, setFields] = useState<Fields>({
    namadepan: '',
    namatengah: '',
    namabelakang: '',
    hp: '',
    email: '',
    namaktp: '',
    namafoto: '',
    gender: '',
    tgllahir: '',
  });
  const [options, setOptions] = useState({
    ktpFileUploading: false,
    pictureFileUploading: false,
  });
  const [error, setError] = useState<ErrorState<Fields>>({
    fields: [],
    message: undefined,
  });

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date: any) => {
    // const isDate = moment().format("DD/MM/YYYY");
    setDate(date);
    console.warn("A date has been picked: ", date);
    hideDatePicker();
  };

  const getDate = () => {
    if(date == ""){
      let tempDate = "";
      return tempDate;
    }else{
      let tempDate = moment(date).format("YYYY-MM-DD");
      return tempDate;
    }
  };

  const getGender = (gender) => {
    setGender(gender);
  }

  const jk = () => {
    return gender;
  }

  // Effects
  useEffect(() => {
    // 
  }, []);
  
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
    setIsSaving(true);
    return httpService('/api/login/login', {
      data: {
        act: 'KirimPasswordUserTerdaftar',
        dt: JSON.stringify({
          email: fields.email,
          nama: fields.namadepan+' '+fields.namabelakang,
          hp: phone.replace('+', ''), //+fields.hp
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
    if (!fields.hp) {
      return handleErrorShow('hp', t('Please enter your phone number!'));
    } else if (!fields.namadepan) {
      return handleErrorShow('namadepan', t('Please enter first name!'));
    }else if (!fields.namabelakang) {
      return handleErrorShow('namabelakang', t('Please enter last name!'));
    }else if (!fields.email) {
      return handleErrorShow('email', t('Format email salah!'));
    } else if (!validator.isEmail(fields.email)) {
      return handleErrorShow('email', t('Format email salah!'));
    } else if (!fields.foto) {
      // return handleErrorShow('namafoto', t('Mohon pilih file untuk foto profil Anda.'));
    } else if (!fields.ktp) {
      // return handleErrorShow('namaktp', t('Mohon pilih file foto KTP/NPWP Anda.'));
    }else if (!fields.tgllahir) {
      return handleErrorShow('tgllahir', t('Please select your date of birth!'));
    }
    setIsLoading(true);
    return httpService('/api/login/login', {
      data: {
        act: 'CekEmailExist',
        dt: JSON.stringify({
          email: fields.email,
          hp: phone.replace('+', ''),
          nama: fields.namadepan+' '+fields.namatengah+' '+fields.namabelakang,
          namadepan: fields.namadepan,
          namatengah: fields.namatengah,
          namabelakang: fields.namabelakang,
        }),
      }
    }).then(({ status, data }) => {
      setIsLoading(false);
      setIsSaving(false);
      if (status === 200) {
        // Alert.alert( "Pemberitahuan", "Sepertinya anda sudah pernah melakukan transaksi di OPTIK TUNGGAL. Silahkan klik tombol minta password untuk mengakses apps ini dan anda tidak perlu daftar akun baru. Terima Kasih",
        //   [
        //     { text: "Minta Password", onPress: () => kirimPassword() }
        //   ]
        // );
        navigation.navigatePath('Public', {
          screen: 'SelectUsers',
          params: [{
            email : fields.email
          }],
        });
      }else if(status === 201 || status === 203){
        navigation.navigatePath('Public', {
          screen: 'AddressEdit',
          params: [{
            profile: {
              ...fields,
              tgllahir: getDate(),
              gender: jk(),
              email: fields.email,
              // hp: `62${fields.hp}`,
              hp: phone.replace('+', ''), //showPhone(fields.hp, '62'),
            },
          }],
        });
      }else if(status === 202){
        Alert.alert( "Alert", "Maaf, sudah terdaftar. silahkan menggunakan email lain.",
          [
            { text: "Ubah email", onPress: () => console.log('OKE') }
          ]
        );        
      }
    }).catch((err) => {
      setIsSaving(false);
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: 'https://www.resindaparkmall.com/media/k2/items/cache/ba1b7eb9b8ad142948e3b9dce300b4c6_L.jpg'}} style={{ width: '60%', height: 75, alignSelf: 'center' }}/>
      {/*<Typography style={{ textAlign: 'center', marginTop: 10 }}>
        Please fill in your personal data.
      </Typography>*/}
      {/* <Typography size='xs' style={{ marginTop: 20, marginBottom: 10 }}>Nama Depan</Typography> */}
      <TextField
        placeholder={t('Masukan Nama Depan')}
        value={fields.namadepan}
        style={{marginVertical: 5}}
        onChangeText={(value) => handleFieldChange('namadepan', value)}
        error={!!getFieldError('namadepan')}
        message={error.message}
      />
      {/* <Typography size='xs' style={{ marginVertical: 10 }}>Nama Tengah (Jika ada)</Typography> */}
      <TextField
        placeholder={t('Masukan Nama Tengah (Jika ada)')}
        value={fields.namatengah}
        style={{marginVertical: 5}}
        onChangeText={(value) => handleFieldChange('namatengah', value)}
        error={!!getFieldError('namatengah')}
        message={error.message}
      />
      {/* <Typography size='xs' style={{ marginVertical: 10 }}>Nama Belakang</Typography> */}
      <TextField
        placeholder={t('Masukan Nama Belakang')}
        value={fields.namabelakang}
        style={{marginVertical: 5}}
        onChangeText={(value) => handleFieldChange('namabelakang', value)}
        error={!!getFieldError('namabelakang')}
        message={error.message}
      />
      <Typography size='xs' style={{ marginVertical: 10 }}>Tanggal lahir</Typography>
      <PressableBox onPress={showDatePicker}>
        <TextField
          containerStyle={{ marginTop: 12 }}
          placeholder={t('YYYY/MM/DD')}
          value={getDate()}
          onChangeText={(value) => handleFieldChange('tgllahir', value)}
          error={!!getFieldError('tgllahir')}
          message={error.message}
          onPressOut={showDatePicker}
          editable={false}
          right={<Ionicons name="calendar" size={24} color={'#ccc'}/>}
        />
      </PressableBox>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />

      <Typography size='xs' style={{ marginTop: 15 }}>Pilih Jenis Kelamin</Typography>
      <View style={[wrapper.row]}>
        {genderData.map((genderData, key) => {
          return (
            <View key={genderData} style={{marginHorizontal: 5, marginVertical: 5}}>
              <View style={[wrapper.row, {marginTop: 10}]}>
                {gender == key ? (
                  <TouchableOpacity style={styles.radioCircle}>
                    <View style={styles.selectedRb} />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={() => {
                      setGender(key);
                      getGender(key);
                    }}
                    style={styles.radioCircle}>
                    
                  </TouchableOpacity>
                )}
                <Typography style={{marginTop: 3, fontSize: 14, fontWeight: '600', marginHorizontal: 15}}>{genderData}</Typography>
              </View>
            </View>
          );
        })}
      </View>
      
      <Typography size='xs' style={{ marginVertical: 10 }}>Nomor Handphone</Typography>
      <PhoneInput
        containerStyle={{ width: '100%' }}
        textContainerStyle={{ height: 50, borderColor: '#f1f1f1', borderWidth: 1, borderRadius: 5, backgroundColor: '#FEFEFE' }}
        textInputStyle={{ height: 50, fontSize: 13, paddingTop: 12, fontWeight: '600' }}
        codeTextStyle={{ fontSize: 12 }}
        ref={phoneInput}
        defaultValue={phone}
        defaultCode="ID"
        layout="first"
        value={fields.hp}
        placeholder="contoh : 8123456789"
        onChangeText={(value) => handleFieldChange('hp', value)}
        onChangeFormattedText={text => {
          setPhone(text);
        }}
        autoFocus/>
      {/* <Typography size='sm' style={{ marginVertical: 5 }}>Email</Typography> */}
      <TextField
        containerStyle={{ marginTop: 12 }}
        placeholder={t('Masukan email')}
        value={fields.email}
        onChangeText={(value) => handleFieldChange('email', value)}
        keyboardType="email-address"
        autoCapitalize="none"
        error={!!getFieldError('email')}
        message={error.message}
      />

      <Typography size='xs' style={{ marginVertical: 10, color: 'red' }}>
        * Pastikan nomor handphone dan email yang anda masukan benar. kami akan mengirimkan kode OTP melalui Whatsapp atau email.
      </Typography>

      <View style={{ marginTop: 60, paddingTop: 24 }}> 
        <Button 
          containerStyle={{ alignSelf: 'center', borderRadius: 5, backgroundColor: '#0d674e', }} 
          style={{ width: 350, height: 40,  }} 
          onPress={handleSubmit} >
            <Typography style={{ color: '#FEFEFE' }}>{t('Submit').toUpperCase()} </Typography>
        </Button>
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
  dropdown1BtnStyle: {
    width: '100%',
    height: 40,
    backgroundColor: '#FFF',
    borderRadius: 5,
    borderWidth: 1,
    marginTop: 15,
    borderColor: '#ccc',
  },
  radioCircle: {
		height: 20,
		width: 20,
		borderRadius: 100,
		borderWidth: 2,
		borderColor: '#0d674e',
		alignItems: 'center',
		justifyContent: 'center',
		padding: 10
	},
	selectedRb: {
		width: 15,
		height: 15,
		borderRadius: 50,
		backgroundColor: '#0d674e',
  },
  dropdown1BtnTxtStyle: {color: '#444', fontSize: 16, textAlign: 'left'},
});

export type { Fields as RegisterFields };

export default Register;