import moment from "moment";
import { Platform } from "react-native";
import { DocumentPickerResponse } from "react-native-document-picker";
import { Asset } from "react-native-image-picker";
import RNFS from 'react-native-fs';
import ImageResizer from "react-native-image-resizer";

export type ImageManagerParams = Partial<Asset & DocumentPickerResponse>;

type ImageManagerResult = null | {
  name: string;
  value: string;
  extension: string;
  base64: string;
};

const imageManager = async (file: ImageManagerParams): Promise<ImageManagerResult> => {
  const fileName = file.name || file.fileName;
  const fileNames = fileName?.split('.') || [];
  const fileExt = fileNames[fileNames.length - 1];
  const fieldValue = moment().format('YYYYMMDD') + "_" + moment().unix() + "." + fileExt;
  const filePath = Platform.OS === 'android' ? file.uri : file.uri?.replace('file://', '');

  if (!filePath) {
    return new Promise(resolve => resolve(null));
  }

  const image = await ImageResizer.createResizedImage(filePath, 1280, 1280, 'JPEG', 80, 0, undefined, true, {
    mode: 'contain',
    onlyScaleDown: true
  }).then(response => {
    return response.uri;
  }).catch(err => null);

  if (!image) {
    return new Promise(resolve => resolve(null));
  }

  const base64 = await RNFS.readFile(image, 'base64').then((value) => {
    return `data:${'image/jpeg' || file.type};base64,${value}`;
  });

  return new Promise(resolve => resolve({
    name: fileName || fieldValue,
    value: fieldValue,
    extension: 'jpeg', // fileExt,
    base64,
  }));
};

export default imageManager;