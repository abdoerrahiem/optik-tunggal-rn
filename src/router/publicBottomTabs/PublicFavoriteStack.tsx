import React from 'react'
import { createStackNavigator } from '@react-navigation/stack';
import { colors } from '../../lib/styles';
import { Favorite } from '../../ui-public/pages';
import { getHeaderTitle } from '@react-navigation/elements';
import { Header } from '../../ui-shared/components';
import { routeOptions } from '../routerConfig';

export type PublicFavoriteStackParamList = {
  Login: {};
  Register: {};
  Verification: {};
  Profile: {};
  Address: {};
  [key: string]: {};
};

const Stack = createStackNavigator<PublicFavoriteStackParamList>();

function PublicFavoriteStack() {
  return (
    <Stack.Navigator
      initialRouteName="Favorite"
      screenOptions={{
        header: ({ navigation, route, options, back }) => {
          const title = getHeaderTitle(options, route.name);

          return (
            <Header
              title={title}
              // left={!!back}
              {...(!options.headerRight ? null : {
                right: options.headerRight(navigation as any)
              })}
            />
          );
        },
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen name="Favorite" component={Favorite} options={routeOptions('Favorite')} />
    </Stack.Navigator>
  );
}

export default PublicFavoriteStack;