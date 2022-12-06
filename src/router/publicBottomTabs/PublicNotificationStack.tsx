import React from 'react'
import { createStackNavigator } from '@react-navigation/stack';
import { colors } from '../../lib/styles';
import { Notification } from '../../ui-public/pages';
import { getHeaderTitle } from '@react-navigation/elements';
import { Header } from '../../ui-shared/components';
import { routeOptions } from '../routerConfig';
import * as Transactions from '../../ui-public/pages/transactions';
import * as Notifications from '../../ui-public/pages/notifications';
import { PromotionModel } from '../../types/model';

export type PublicNotificationStackParamList = {
  Notification: {};
  PromotionDetail: {
    Promotion?: PromotionModel;
  };
  TransactionDetail: {
    transaction_id?: string;
  };
  [key: string]: {};
};

const Stack = createStackNavigator<PublicNotificationStackParamList>();

function PublicNotificationStack() {
  return (
    <Stack.Navigator
      initialRouteName="Notification"
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
      <Stack.Screen name="Notification" component={Notification} options={routeOptions('Notification')} />

      {/* Transactions */}
      {(Object.keys(Transactions) as Array<keyof typeof Transactions>)
        .filter((name: string) => [].indexOf(name as never) < 0) // Except
        .map((name) => (
          <Stack.Screen key={name} name={name} component={Transactions[name]} options={routeOptions(name)} />
        ))}

      {/* Notifications */}
      {(Object.keys(Notifications) as Array<keyof typeof Notifications>)
        .filter((name: string) => [].indexOf(name as never) < 0) // Except
        .map((name) => (
          <Stack.Screen key={name} name={name} component={Notifications[name]} options={routeOptions(name)} />
        ))}

    </Stack.Navigator>
  );
}

export default PublicNotificationStack;
