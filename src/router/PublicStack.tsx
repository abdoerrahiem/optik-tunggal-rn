import React from 'react'
import { createStackNavigator } from '@react-navigation/stack';
import { getHeaderTitle } from '@react-navigation/elements';
import {
  Walkthrough,
} from '../ui-public/pages';
import PublicBottomTab from './PublicBottomTab';
import * as Company from '../ui-public/pages/company';
import { routeOptions } from './routerConfig';
import { Header } from '../ui-shared/components';

export type PublicStackParamList = {
  Login: {};
  Register: {};
  Walkthrough: {};
  [key: string]: {};
};

const Stack = createStackNavigator<PublicStackParamList>();

function PublicStack() {
  return (
    <Stack.Navigator
      initialRouteName="BottomTabs"
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
      <Stack.Screen name="BottomTabs" component={PublicBottomTab} options={{ headerShown: false }} />

      {/* Company Pages */}
      {(Object.keys(Company) as Array<keyof typeof Company>)
        .filter((name: string) => [].indexOf(name as never) < 0) // Except
        .map((name) => (
          <Stack.Screen key={name} name={name} component={Company[name]} options={routeOptions(name)} />
        ))}
    </Stack.Navigator>
  )
}

export default PublicStack;
