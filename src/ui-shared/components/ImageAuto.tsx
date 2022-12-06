import React, { FunctionComponent, useEffect, useState } from 'react';
import { Image, ImageProps, ImageSourcePropType, ImageURISource } from 'react-native';

type Props = ImageProps & {
  source?: ImageSourcePropType & (ImageURISource | undefined);
};

const ImageAuto: FunctionComponent<Props> = ({
  source,
  width: valueWidth,
  height: valueHeight,
  style,
  ...props
}) => {
  // States
  const [imageWidth, setImageWidth] = useState(0);
  const [imageHeight, setImageHeight] = useState(0);

  // Effects
  useEffect(() => {
    if (source?.uri) {
      Image.getSize(source.uri, (width, height) => {
        handleResize(width, height);
      });
    } else {
      const { width, height } = Image.resolveAssetSource(source);

      handleResize(width, height);
    }
  }, []);

  // Vars
  const handleResize = (width: number, height: number) => {
    if (valueWidth && valueHeight) {
      setImageWidth(valueWidth);
      setImageHeight(valueHeight);
    } else if (valueWidth) {
      setImageWidth(valueWidth);
      setImageHeight(height / width * valueWidth);
    } else if (valueHeight) {
      setImageWidth(width / height * valueHeight);
      setImageHeight(valueHeight);
    }
  };

  return (
    <Image
      source={source}
      style={[
        {
          width: imageWidth,
          height: imageHeight,
          resizeMode: 'cover',
        },
        style
      ]}
      {...props}
    />
  );
};

export default ImageAuto;
