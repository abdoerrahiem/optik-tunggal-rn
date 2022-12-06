import React from 'react';
import RenderHTML, { defaultHTMLElementModels, HTMLContentModel, HTMLElementModelRecord, MixedStyleDeclaration, RenderHTMLProps } from 'react-native-render-html';
import Typography from './Typography';
import { colors, typography } from '../../lib/styles';
import { TextProps, TextStyle } from 'react-native';

type Props = RenderHTMLProps & {

};

const RenderHtml = ({
  source,
  customHTMLElementModels: customHTMLElsParams = {},
  tagsStyles: tagsStylesParams = {},
  defaultTextProps: defaultTextPropsParams = {},
  defaultViewProps: defaultViewPropsParams = {},
  ...props
}: Props) => {
  const paragraph: MixedStyleDeclaration = {
    ...typography.regular,
    color: colors.gray[900],
    marginTop: 0,
    height: 'auto',
    textAlign: 'justify',
  };
  const tagsStyles: Readonly<Record<string, MixedStyleDeclaration>> = {
    body: paragraph,
    p: paragraph,
    small: { ...paragraph, ...typography.sizeSm },
    span: { ...paragraph, ...typography.sizeXs },
    h1: { ...paragraph, ...typography.h1, marginBottom: 8 },
    h2: { ...paragraph, ...typography.h2, marginBottom: 8 },
    h3: { ...paragraph, ...typography.h3, marginBottom: 8 },
    h4: { ...paragraph, ...typography.h4, marginBottom: 8 },
    h5: { ...paragraph, ...typography.h5, marginBottom: 8 },
    h6: { ...paragraph, ...typography.h6, marginBottom: 8 },
    table: { marginBottom: 16 },
    td: paragraph,
    th: { ...paragraph, ...typography.h },
    ul: {
      paddingLeft: 24,
      marginTop: 0,
    },
    ol: {
      ...paragraph,
      paddingLeft: 24,
      marginTop: 0,
    },
    li: {
      ...paragraph,
      paddingLeft: 4,
      marginBottom: 4,
    },
    ...tagsStylesParams,
  };

  const classesStyles = {
    ...tagsStyles,
    xs: { ...paragraph, ...typography.sizeXs },
    xxs: { ...paragraph, ...typography.sizeXxs },
  };

  const defaultTextProps: TextProps = {
    style: {
      ...typography.regular,
      marginTop: 0,
    },
    ...defaultTextPropsParams,
  };

  const defaultViewProps: TextProps = {
    style: {
      height: 'auto',
    },
    ...defaultViewPropsParams,
  };

  return (
    <RenderHTML
      source={source}
      tagsStyles={tagsStyles}
      classesStyles={classesStyles}
      ignoredStyles={['fontFamily', 'fontSize']}
      defaultTextProps={defaultTextProps}
      defaultViewProps={defaultViewProps}
      systemFonts={['Poppins-Regular', 'Poppins-Bold', 'Poppins']}
      {...props}
    />
  );
};

export default RenderHtml;
