import React from 'react'
import { createStackNavigator } from '@react-navigation/stack';
import { colors } from '../../lib/styles';
import { OurStore } from '../../ui-public/pages/store';
import { getHeaderTitle } from '@react-navigation/elements';
import { Header } from '../../ui-shared/components';
import { routeOptions } from '../routerConfig';
// import * as OurStore from '../../ui-public/pages/otherpage';

export type PublicOurStoreStackParamList = {
 //OurStore: {};
  [key: string]: {};
};

const Stack = createStackNavigator<PublicOurStoreStackParamList>();

function PublicOurStoreStack() {
  return (
    <Stack.Navigator
      initialRouteName="OurStore"
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
      <Stack.Screen name="OurStore" component={OurStore} options={routeOptions('OurStore')} />

      {/* OurStore */}
      {(Object.keys(OurStore) as Array<keyof typeof OurStore>)
        .filter((name: string) => [].indexOf(name as never) < 0) // Except
        .map((name) => (
          <Stack.Screen key={name} name={name} component={OurStore[name]} options={routeOptions(name)} />
        ))}
    </Stack.Navigator>
  );
}

export default PublicOurStoreStack;
