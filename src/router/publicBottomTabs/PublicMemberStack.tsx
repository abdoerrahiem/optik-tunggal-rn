import React from 'react'
import { createStackNavigator } from '@react-navigation/stack';
import { colors } from '../../lib/styles';
import { Members } from '../../ui-public/pages/members';
import { getHeaderTitle } from '@react-navigation/elements';
import { Header } from '../../ui-shared/components';
import { routeOptions } from '../routerConfig';
// import * as Members from '../../ui-public/pages/otherpage';

export type PublicMemberStackParamList = {
 //Members: {};
  [key: string]: {};
};

const Stack = createStackNavigator<PublicMemberStackParamList>();

function PublicMemberStack() {
  return (
    <Stack.Navigator
      initialRouteName="Members"
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
      <Stack.Screen name="Members" component={Members} options={routeOptions('Members')} />

      {/* Members */}
      {(Object.keys(Members) as Array<keyof typeof Members>)
        .filter((name: string) => [].indexOf(name as never) < 0) // Except
        .map((name) => (
          <Stack.Screen key={name} name={name} component={Members[name]} options={routeOptions(name)} />
        ))}
    </Stack.Navigator>
  );
}

export default PublicMemberStack;
