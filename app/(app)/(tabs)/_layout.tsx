import React from 'react';
import { createMaterialBottomTabNavigator, MaterialBottomTabNavigationOptions } from 'react-native-paper/react-navigation';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { withLayoutContext } from "expo-router";
import { px } from '@/utlis/size';


const { Navigator } = createMaterialBottomTabNavigator();

export const MaterialBottomTabs = withLayoutContext<
  // @ts-ignore
  MaterialBottomTabNavigationOptions,
  typeof Navigator
>(Navigator);


export default function TabLayout() {

  return (
    <MaterialBottomTabs
      safeAreaInsets={{
        top: 0,
        bottom: 0
      }}
    >
      <MaterialBottomTabs.Screen
        name="index"
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name={'home'}
              color={color}
              size={px(46)}
            />
          ),
        }}
      />
      <MaterialBottomTabs.Screen
        name="thread"
        options={{
          title: 'Thread',
          tabBarIcon: ({ color }) => (
            <MaterialIcons
              name={'alternate-email'}
              color={color}
              size={px(46)}
            />
          ),
        }}
      />
    </MaterialBottomTabs>
  );
}
