import React from 'react'
import { createStackNavigator } from '@react-navigation/stack';
import { colors } from '../../lib/styles';
import { Contact } from '../../ui-public/pages';
import { getHeaderTitle } from '@react-navigation/elements';
import { Header } from '../../ui-shared/components';
import { routeOptions } from '../routerConfig';
import * as Contacts from '../../ui-public/pages/contacts';

export type PublicContactStackParamList = {
  Contact: {};
  OurContact: {};
  [key: string]: {};
};

const Stack = createStackNavigator<PublicContactStackParamList>();

function PublicContactStack() {
  return (
    <Stack.Navigator
      initialRouteName="Contact"
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
      <Stack.Screen name="Contact" component={Contact} options={routeOptions('Contact')} />

      {/* Contacts */}
      {(Object.keys(Contacts) as Array<keyof typeof Contacts>)
        .filter((name: string) => [].indexOf(name as never) < 0) // Except
        .map((name) => (
          <Stack.Screen key={name} name={name} component={Contacts[name]} options={routeOptions(name)} />
        ))}

    </Stack.Navigator>
  );
}

export default PublicContactStack;
