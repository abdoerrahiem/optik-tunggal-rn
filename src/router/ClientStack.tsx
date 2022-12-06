import React from 'react'
import { createStackNavigator } from '@react-navigation/stack';
import { colors } from '../lib/styles';

export type ClientStack = {
  // BottomTabs: {};
};

const Stack = createStackNavigator<ClientStackParamList>();

function ClientStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: colors.palettes.primaryText,
        headerStyle: {
          backgroundColor: colors.palettes.primary
        },
        headerBackTitle: 'Back',
        headerBackTitleVisible: false,
      }}
    >
      
    </Stack.Navigator>
  );
}

export default ClientStack;
