import React from 'react'
import { createStackNavigator } from '@react-navigation/stack';
import { getHeaderTitle } from '@react-navigation/elements';
import { Home } from '../../ui-public/pages';
import Header from '../../ui-shared/components/Header';

import * as Orders from '../../ui-public/pages/orders';
import * as Products from '../../ui-public/pages/products';
import { routeOptions } from '../routerConfig';
import { AddressModel, CartModel, CategoryModel, PaymentMethodType, ProductModel, TransactionModel, BrandModel } from '../../types/model';

export type PublicHomeStackParamList = {
  Home: {};
  Search: {
    search?: string;
    category?: CategoryModel;
    brand?: BrandModel[];
    // gender?: GenderModel;
  };
  ProductDetail: {
    product_id: string;
    product?: Partial<ProductModel>;
  };
  ProductDetailAdlens: {
    product_id: string;
    product?: Partial<ProductModel>;
  };
  ProductDetailClear: {
    product_id: string;
    product?: Partial<ProductModel>;
  };
  ProductDetailSerupa: {
    product_id: string;
    product?: Partial<ProductModel>;
  };
  Cart: {};
  Checkout: {
    cart_items?: CartModel[];
    address?: AddressModel;
  };
  PaymentMethod: {
    cart_items?: CartModel[];
    address?: AddressModel;
    transaction?: TransactionModel;
  };
  PaymentMerchant: {
    cart_items?: CartModel[];
    address?: AddressModel;
    payment_method?: PaymentMethodType;
    transaction?: TransactionModel;
    transaction_id?: number;
  };
  WebviewCC: {}
  [key: string]: {};
};

const Stack = createStackNavigator<PublicHomeStackParamList>();

function PublicHomeStack() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
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
      <Stack.Screen name="Home" component={Home} options={routeOptions('Home')} />

      {/* Orders */}
      {(Object.keys(Orders) as Array<keyof typeof Orders>)
        .filter((name: string) => [].indexOf(name as never) < 0) // Except
        .map((name) => (
          <Stack.Screen key={name} name={name} component={Orders[name]} options={routeOptions(name)} />
        ))}

      {/* Products */}
      {(Object.keys(Products) as Array<keyof typeof Products>)
        .filter((name: string) => [].indexOf(name as never) < 0) // Except
        .map((name) => (
          <Stack.Screen key={name} name={name} component={Products[name]} options={routeOptions(name)} />
        ))}

    </Stack.Navigator>
  );
}

export default PublicHomeStack;
