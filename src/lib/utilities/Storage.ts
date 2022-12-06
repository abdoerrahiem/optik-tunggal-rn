import AsyncStorage from '@react-native-async-storage/async-storage'
import { getConfig } from '../config';

const storeKey = getConfig('STORAGE_KEY');

const Storage = {
  storeData: async (key: string, value: any): Promise<void> => {
    try {
      const json = JSON.stringify(value);

      AsyncStorage.setItem(`${storeKey}_${key}`, json);

      return new Promise(resolve => resolve());
    } catch (e) {
      //
      return new Promise(resolve => resolve());
    }
  },
  getData: async (key: string, fallbackValue: any = null): Promise<null | any> => {
    try {
      const value = await AsyncStorage.getItem(`${storeKey}_${key}`);

      return null !== value ? JSON.parse(value) : fallbackValue;
    } catch (e) {
      return fallbackValue;
    }
  },
  removeData: (key: string): Promise<void> => {
    try {
      return AsyncStorage.removeItem(key);
    } catch (e) {
      // 
      return new Promise(resolve => resolve());
    }
  },
  clearAll: (): Promise<void> => {
    try {
      return AsyncStorage.clear();
    } catch (e) {
      // Resolve false
      return new Promise(resolve => resolve());
    }
  }
};

export default Storage;
