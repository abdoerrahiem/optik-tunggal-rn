import React, { useEffect, useRef, useState } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import MapView, { Region } from 'react-native-maps';
import { useAppSelector } from '../../redux/hooks';
import { ValueOf } from '../../types/utilities';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Badge, Button } from '../../ui-shared/components';
import { colors } from '../../lib/styles';
import { httpService } from '../../lib/utilities';
import { getConfig } from '../../lib/config';
import Geolocation from '@react-native-community/geolocation';
import { useTranslation } from 'react-i18next';

type Props = {
  latitude?: number;
  longitude?: number;

  onUpdate?: (lat: number, lng: number) => void;

  style?: StyleProp<ViewStyle>;
};

type Fields = {
  latlng?: string;
  location?: string;
};

function MapsLocationSelect({
  latitude,
  longitude,
  onUpdate,
  style,
  ...props
}: Props) {
  // Hooks
  const { location } = useAppSelector(({ user }) => user);
  const { t } = useTranslation('account');

  const mapRef = useRef<MapView | null>(null);

  // States
  const [fields, setFields] = useState<Fields>({
    latlng: '',
    location: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Effects
  useEffect(() => {
    if (latitude && longitude) {
      setIsEditing(true);

      setTimeout(() => {
        handleAnimateMapRegionChange({
          latitude,
          longitude,
          latitudeDelta: 0.0029,
          longitudeDelta: 0.0031,
        });
      }, 250);
    }

    setIsLoading(true);

    Geolocation.getCurrentPosition(() => void(0), () => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (latitude && longitude) {
      handleFieldChange('latlng', `${latitude},${longitude}`);
    }
  }, [latitude, longitude]);

  // Vars
  const handleFieldChange = (field: keyof Fields, value: ValueOf<Fields>) => {
    setFields(state => ({
      ...state,
      [field]: value
    }));
  };

  const handleMapRegionChange = (region: Region) => {
    handleFieldChange('latlng', `${region.latitude},${region.longitude}`);

    'function' === typeof onUpdate && onUpdate(region.latitude, region.longitude);
  };

  const handleAnimateMapRegionChange = (region: Region) => {
    mapRef.current?.animateToRegion(region, 666);

    handleFieldChange('latlng', `${region.latitude},${region.longitude}`);

    'function' === typeof onUpdate && onUpdate(region.latitude, region.longitude);
  };

  const handleFetchAddress = async () => {
    await httpService('https://maps.googleapis.com/maps/api/geocode/json', {
      method: 'GET',
      data: {
        key: getConfig('GMAPS_API_KEY'),
        latlng: `${fields.latlng}`
      }
    }).then(({ results }) => {
      if (results?.length) {
        const { formatted_address } = results[0];

        console.log("location.RESULT", formatted_address);

        handleFieldChange('location', formatted_address);
      }
    }).catch((err) => {
      console.error("Error while getting given address");
    });
  };

  const initLocation = {
    latitude: location.lat || -6.3583183952102615,
    longitude: location.lng || 107.14480021968484,

    latitudeDelta: 0.0025,
    longitudeDelta: 0.0018,
  };

  return (
    <View style={[styles.container, style]} {...props}>
      {/* The Map */}
      <MapView
        ref={mapRef}
        initialRegion={initLocation}
        onUserLocationChange={({ nativeEvent: { coordinate } }) => {
          const { latitude, longitude } = coordinate;

          if (!isEditing) {
            handleAnimateMapRegionChange({
              latitude,
              longitude,
              latitudeDelta: 0.0029,
              longitudeDelta: 0.0031,
            });
          }

          setIsLoading(false);
        }}
        onRegionChangeComplete={handleMapRegionChange}
        onDoublePress={() => {
          setIsEditing(true);

          if (fields.location) {
            handleFieldChange('location', '');
          }
        }}
        onPanDrag={() => {
          setIsEditing(true);

          if (fields.location) {
            handleFieldChange('location', '');
          }
        }}
        userLocationUpdateInterval={2500}
        userLocationFastestInterval={2500}
        showsMyLocationButton={false}
        showsUserLocation
        followsUserLocation
        style={{ flex: 1 }}
      />

      {/* Map Center Point */}
      <Ionicons
        name="location-sharp"
        size={32}
        color={colors.palettes.red}
        style={styles.mapCenterPoint}
      />

      {/* Map Infos */}
      {!isLoading ? null : (
        <Badge
          style={[styles.mapAction, {
            bottom: 34,
            alignSelf: 'center',
            marginHorizontal: 'auto',
            paddingVertical: 4,
            paddingHorizontal: 8,
            borderRadius: 8,
          }]}
          label="Mencari lokasi Anda"
          labelProps={{ size: 'sm' }}
          color="info"
        />
      )}

      {/* Map Action Buttons */}
      <Button
        size={28}
        rounded
        containerStyle={{
          ...styles.mapAction,
          ...styles.btnShadow,
          bottom: 25,
          right: 25,
        }}
        style={styles.mapActionBtn}
        onPress={() => {
          Geolocation.getCurrentPosition(() => void (0), () => setIsLoading(false));

          setIsEditing(false);
          setIsLoading(true);
        }}
      >
        <Ionicons name="locate" size={20} color={colors.palettes.blue} />
      </Button>

      {!isEditing || fields.location ? null : (
        <Button
          label={t(`Konfirmasi`)}
          labelProps={{ size: 'sm' }}
          size="sm"
          rounded={8}
          color="primary"
          containerStyle={[styles.mapAction, { bottom: 24, right: 66 }]}
          style={{ paddingVertical: 6 }}
          onPress={handleFetchAddress}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: colors.white,
  },

  btnShadow: {
    elevation: 3,
  },

  mapCenterPoint: {
    position: 'absolute',
    top: '50%',
    marginTop: -32,
    alignSelf: 'center',
    elevation: 3,
  },
  mapAction: {
    alignSelf: 'flex-start',
    position: 'absolute',
    zIndex: 10,
  },
  mapActionBtn: {
    backgroundColor: colors.white
  }
});

export default MapsLocationSelect;
