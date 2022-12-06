import React from 'react'
import { createStackNavigator } from '@react-navigation/stack';
import { Account, AddressEditFields, RegisterFields } from '../../ui-public/pages';
import { getHeaderTitle } from '@react-navigation/elements';
import { Header } from '../../ui-shared/components';
import * as Authentications from '../../ui-public/pages/auth';
import * as Accounts from '../../ui-public/pages/accounts';
import { routeOptions } from '../routerConfig';
import { RootStackParamList } from '../Router';
import { AddressModel } from '../../types/model';

export type PublicAccountStackParamList = {
  Account: {};
  Login: {
    action?: string;
  };
  Register: {};
  Verification: {
    profile?: RegisterFields;
    address?: AddressEditFields;
    email?: string;
  };
  Profile: {};
  AddressEdit: {
    profile?: RegisterFields;
    address?: AddressModel;
    action?: string;
  };
  AddressList: {
    action_screen?: [keyof RootStackParamList, string?];
    refresh?: boolean;
  };
  PinEdit: {
    profile?: RegisterFields;
    address?: AddressEditFields;
    action?: string;
  };
  [key: string]: {};
};

const Stack = createStackNavigator<PublicAccountStackParamList>();

function PublicAccountStack() {
  return (
    <Stack.Navigator
      initialRouteName="Account"
      screenOptions={{
        header: ({ navigation, route, options, back }) => {
          const title = getHeaderTitle(options, route.name);

          return (
            <Header
              title={title}
              left={!!back}
              {...(!options.headerRight ? null : {
                right: options.headerRight(navigation as any)
              })}
            />
          );
        },
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen name="Account" component={Account} options={routeOptions('Account')} />

      {/* Authentications */}
      {(Object.keys(Authentications) as Array<keyof typeof Authentications>)
        .filter((name: string) => [].indexOf(name as never) < 0) // Except
        .map((name) => (
          <Stack.Screen key={name} name={name} component={Authentications[name]} options={routeOptions(name)} />
        ))}

      {/* Accounts */}
      {(Object.keys(Accounts) as Array<keyof typeof Accounts>)
        .filter((name: string) => [].indexOf(name as never) < 0) // Except
        .map((name) => (
          <Stack.Screen key={name} name={name} component={Accounts[name]} options={routeOptions(name)} />
        ))}

    </Stack.Navigator>
  );
}

export default PublicAccountStack;
