import React, { useEffect, useState } from 'react';
import { Image, Platform, StyleSheet, View, ViewProps, Dimensions, Linking, useWindowDimensions } from 'react-native';
import Typography, { TypographyProps } from './Typography';
import TextField from './TextField';
import Button, { ButtonProps } from './Button';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { IconProps } from 'react-native-vector-icons/Icon';
import { colors, wrapper } from '../../lib/styles';
import { useAppNavigation } from '../../router/RootNavigation';
import { TextFieldProps } from '.';
import { BottomDrawer, PressableBox } from '.';

type Props = ViewProps & {
  title?: string | string[] | React.ReactNode[];
  titleProps?: TypographyProps;
  hideLogo?: boolean;
  hideBg?: boolean;

  search?: string;
  searchProps?: TextFieldProps;
  hideSearch?: boolean;

  left?: boolean | React.ReactNode; // If true show Back button
  leftProps?: ButtonProps;
  leftIconProps?: Partial<IconProps>;

  right?: boolean | React.ReactNode; // If true show Back button
  rightProps?: ButtonProps;
  rightIconProps?: Partial<IconProps>;
};

type OptionsState = {
  filterModalOpen?: boolean;
};

function HeaderNew({
  style,
  title: titles = [],
  titleProps = {},
  hideLogo = false,
  hideBg = false,
  search: searchValue = '',
  searchProps,
  hideSearch = false,
  left = true,
  leftProps = {},
  leftIconProps = {},
  right = false,
  rightProps = {},
  rightIconProps = {},
  children,
  ...props
}: Props) {
  // Hooks
  const navigation = useAppNavigation();
  // State
  const { width, height } = useWindowDimensions();
  const [search, setSearch] = useState(searchValue);
  const [options, setOptions] = useState<OptionsState>({
    filterModalOpen: false,
  });

  // Effects
  useEffect(() => {
    setSearch(searchValue);
  }, [searchValue]);

  // Vars
  const renderTitle = () => {
    return 'string' === typeof title ? (
      <View style={{ flex: 1, alignSelf: 'center', alignItems: 'center' }}>
        <Typography
          style={{marginTop: -25, color: '#333333'}}
          textAlign="center"
          {...titleProps}
        >{title}</Typography>

        {!subtitle ? null : (
          <Typography size="sm" textAlign="center" style={{ marginTop: 4, color: '#FFFFFF' }}>
            {subtitle}
          </Typography>
        )}
      </View>
    ) : title;
  };

  const handleCloseModal = async () => {
    handleModalToggle('popup', false);
  };

  const handleModalToggle = async (type: string, open: boolean | null = null) => {
    switch (type) {
      case 'popup':
        setOptions(state => ({
          ...state,
          filterModalOpen: 'boolean' === typeof open ? open : !options.filterModalOpen
        }));
        break;
    }
  };

  const handleSearch = () => {
    navigation.navigatePath('Public', {
      screen: 'BottomTabs.HomeStack.Search',
      params: [null, null, {
        search,
      }]
    });
  };

  const [title, subtitle] = 'string' === typeof titles ? [titles] : [...titles];

  return (
    <View style={[styles.headercolor, {position: 'relative'}]}>      
      <View style={[styles.container, style]} {...props}>
        <View style={[wrapper.row, {width: '100%', height: 40}]}>
          <View style={{ flex:1 }}>
            <Image source={require('../../assets/logocard-removebg-preview.png')} style={styles.logo} />
          </View>
          <Button
            containerStyle={{ alignSelf: 'flex-start', }}
            size={40}
            color="transparent"
            onPress={() => navigation.navigatePath('Public', {
              screen: 'Notification',
            })}
            {...rightProps}
            style={{marginTop: -5}}
          >
            <Ionicons name="notifications-outline" size={22} color={'#0d674e'} {...rightIconProps} />
          </Button>
          <Button
            containerStyle={{ alignSelf: 'flex-start',  }}
            size={40}
            color="transparent"
            onPress={() => handleModalToggle('popup', true)}
            {...rightProps}
            style={{marginTop: -5}}
          >
            <Ionicons name="logo-whatsapp" size={22} color={'#0d674e'} {...rightIconProps} />
          </Button>
          <Button
            containerStyle={{ alignSelf: 'flex-start',  }}
            size={40}
            color="transparent"
            onPress={() => navigation.navigatePath('Public', {
              screen: 'Search',
            })}
            {...rightProps}
            style={{marginTop: -5}}
          >
            <Ionicons name="search-outline" size={22} color={'#0d674e'} {...rightIconProps} />
          </Button>
        </View>
      </View>
      {/* Popup Filter */}
      <BottomDrawer
        isVisible={options.filterModalOpen}
        swipeDirection={null}
        onBackButtonPress={() => handleModalToggle('filter', false)}
        onBackdropPress={() => handleModalToggle('filter', false)}
        style={{ maxHeight: height * 0.75 }}
      >
        <Button
          containerStyle={{ alignItems: 'flex-end', marginBottom: 10, marginTop: -15 }}
          onPress={handleCloseModal}
        >
          <Ionicons name="ios-close" size={24} color={'#333'} {...leftIconProps} />
          <Typography style={{ color: '#333' }}>Tutup</Typography>
        </Button>
        <Image 
          source={require('../../assets/popup/cs.jpg')} 
          style={{ width: '90%', height: '50%', alignSelf: 'center', resizeMode: 'stretch', borderRadius: 10 }} />
        <Typography style={{ marginVertical: 20, fontSize: 15, textAlign: 'center'}}>
          {`LIVE CHAT : `}{`\n`}{`Senin - Jum'at ( 08:30 - 17:30 WIB).`}
        </Typography>
        <Button
          containerStyle={{ alignSelf: 'center', backgroundColor: '#0d674e' }}
          style={{ minWidth: 350 }}
          onPress={() => Linking.openURL('https://api.whatsapp.com/send/?phone=6281113203000&text=Halo+Optik+Tunggal&app_absent=0')}
        >
          <Ionicons name="logo-whatsapp" size={24} color={'#fff'} {...leftIconProps} />
          <Typography style={{ color: '#fff', marginLeft: 10 }}>Chat Langsung</Typography>
        </Button>
        {/* <Button
          containerStyle={{ alignSelf: 'center', marginBottom: 20, backgroundColor: '#0d674e' }}
          style={{ minWidth: 250 }}
          onPress={() => Linking.openURL('https://api.whatsapp.com/send/?phone=6281113511000&text=Halo+Optik+Tunggal&app_absent=0')}
        >
          <Ionicons name="logo-whatsapp" size={24} color={'#fff'} {...leftIconProps} />
          <Typography style={{ color: '#fff', marginLeft: 10 }}>Customer Service 2</Typography>
        </Button> */}
      </BottomDrawer>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 15,
    paddingHorizontal: 5,
    position: 'relative',
  },

  headercolor: {
    width: Dimensions.get('window').width,
    height: 60,
    // backgroundColor: "#204c29",
    backgroundColor: "#fff",
    position: 'absolute',
    resizeMode: 'cover',
    borderBottomColor: '#0d674e',
    borderBottomWidth: 5
  },

  logo: {
    width: 135,
    height: 40,
    marginTop: -5,
    marginLeft: 5
  }
});

export type { Props as HeaderProps };

export default HeaderNew;
