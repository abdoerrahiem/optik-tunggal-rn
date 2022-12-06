import React from 'react'
import { createStackNavigator } from '@react-navigation/stack';
import { colors } from '../../lib/styles';
import { Cart } from '../../ui-public/pages/cart';
import { getHeaderTitle } from '@react-navigation/elements';
import { Header } from '../../ui-shared/components';
import { routeOptions } from '../routerConfig';
// import * as Cart from '../../ui-public/pages/otherpage';

export type PublicCartStackParamList = {
 //Cart: {};
  [key: string]: {};
};

const Stack = createStackNavigator<PublicCartStackParamList>();

function PublicCartStack() {
  return (
    <Stack.Navigator
      initialRouteName="Cart"
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
      <Stack.Screen name="Cart" component={Cart} options={routeOptions('Cart')} />

      {/* Cart */}
      {(Object.keys(Cart) as Array<keyof typeof Cart>)
        .filter((name: string) => [].indexOf(name as never) < 0) // Except
        .map((name) => (
          <Stack.Screen key={name} name={name} component={Cart[name]} options={routeOptions(name)} />
        ))}

    </Stack.Navigator>
  );
}

export default PublicCartStack;
