import React, { createRef } from 'react';
import { NavigationContainerRef, NavigationProp, StackActions, useNavigation } from '@react-navigation/core';
import { RootStackParamList } from './Router';
import { ValueOf } from '../types/utilities';

export type RootNavigationProp = NavigationContainerRef<RootStackParamList>;

export const useAppNavigation = () => {
  type AppNavigation = NavigationProp<RootStackParamList> & {
    navigatePath: (screen: keyof RootStackParamList, args?: {}) => void;
  };

  const navigation = useNavigation<AppNavigation>();

  navigation.navigatePath = (screen: keyof RootStackParamList, args: {} = {}) => {
    const { screen: path, params = [] }: any = args;
    const paths: string[] = path.split('.');
    let navigateArgs = {};

    paths.reverse().forEach((screenName, index) => {
      const rowParams = params[paths.length - (index + 1)];

      navigateArgs = {
        screen: screenName,
        params: {
          ...navigateArgs,
          ...(!rowParams ? null : {
              ...rowParams,
          }),
        }
      };
    });

    navigation.navigate(screen, navigateArgs);
  };

  return navigation;
};

export const navigationRef = createRef<RootNavigationProp>();

const navigation = {
  navigate: (name: keyof RootStackParamList, params: ValueOf<RootStackParamList>) => {
    navigationRef.current?.navigate(name, params);
  },
  push: (name: string, params?: object) => {
    navigationRef.current?.dispatch(StackActions.push(name, params));
  },
};

export default navigation;
