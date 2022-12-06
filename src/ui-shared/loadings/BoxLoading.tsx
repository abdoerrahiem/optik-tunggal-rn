import React, { FunctionComponent } from 'react';
import ContentLoader, { IContentLoaderProps, Rect } from 'react-content-loader/native';
import { colors } from '../../lib/styles';
import { default as _random } from 'lodash/random';

type Props = Omit<IContentLoaderProps, 'width' | 'height'> & {
  width?: number | number[];
  height?: number | number[];
  rounded?: number;
};

const BoxLoading: FunctionComponent<Props> = ({
  width: boxWidth = 20,
  height: boxHeight = 20,
  rounded = 3,
  ...props
}) => {
  // Vars
  const width = 'number' === typeof boxWidth ? boxWidth : _random(...boxWidth as any);
  const height = 'number' === typeof boxHeight ? boxHeight : _random(...boxHeight as any);

  const viewWidth = width;
  const viewHeight = height;

  return (
    <ContentLoader
      speed={2}
      width={width}
      height={viewHeight}
      viewBox={`0 0 ${viewWidth} ${viewHeight}`}
      backgroundColor={colors.gray[300]}
      foregroundColor={colors.gray[400]}
      {...props}
    >
      {/* Row 1 */}
      <Rect x="0" y="1" rx={rounded} ry={rounded} width={width} height={height} />
    </ContentLoader>
  );
};

export default BoxLoading;
