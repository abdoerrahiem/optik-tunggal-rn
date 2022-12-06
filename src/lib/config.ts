import { Platform } from 'react-native';
import * as CONFIG from '../config.json';
import * as CONFIG_PROD from '../config.prod.json';

type ConfigType = typeof CONFIG & typeof CONFIG_PROD;

/* Development or Production */
export const isDev = 'development' === process?.env?.NODE_ENV;

/**
 * Get value from config.json
 * 
 * @param {string} key Config key
 * @returns mixed
 */
export const getConfig = (key: keyof ConfigType) => {
  // Dev mode use CONFIG
  const result = (isDev ? CONFIG[key] : (
    // Get from CONFIG_PROD with fallback of CONFIG
    CONFIG_PROD[key as keyof typeof CONFIG_PROD] || CONFIG[key]
  ));

  return undefined === typeof result ? null : result;
};

export const isPlatformOS = (platform: "ios" | "android") => {
  return Platform.OS === platform;
};

export const isVersionValid = (version: number) => {
  let currentVersion = getConfig('app_version') as number;

  if ('ios' === Platform.OS) {
    currentVersion = getConfig('app_version_ios') as number;
  }

  return currentVersion >= version;
};
