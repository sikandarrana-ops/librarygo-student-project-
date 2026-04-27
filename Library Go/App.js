import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';

import SplashScreen from './SplashScreen';
import LoginScreen from './LoginScreen';
import SignupScreen from './SignupScreen';
import BrowseCatalogScreen from './BrowseCatalogScreen';
import ReviewsScreen from './ReviewsScreen';
import AddReviewScreen from './AddReviewScreen';
import HomeScreen from './HomeScreen';
import ReadingListScreen from './ReadingListScreen';
import MyBorrowingsScreen from './MyBorrowingsScreen';
import ProfileScreen from './ProfileScreen';
import BorrowingScreen from './BorrowingScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Proper tab icons using Text (emoji) - no external icon library needed
function TabIcon({ name, focused }) {
  const map = { Home: '🏠', Saved: '🔖', Borrowed: '📋', Profile: '👤' };
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{map[name]}</Text>
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#e53935',
        tabBarInactiveTintColor: '#aaa',
        tabBarStyle: {
          height: 62,
          paddingBottom: 10,
          paddingTop: 6,
          borderTopWidth: 1,
          borderTopColor: '#f0f0f0',
          backgroundColor: '#fff',
          elevation: 10,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 10,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700', marginTop: 2 },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon name="Home" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Reading List"
        component={ReadingListScreen}
        options={{
          tabBarLabel: 'Saved',
          tabBarIcon: ({ focused }) => <TabIcon name="Saved" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Borrowings"
        component={MyBorrowingsScreen}
        options={{
          tabBarLabel: 'Borrowed',
          tabBarIcon: ({ focused }) => <TabIcon name="Borrowed" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon name="Profile" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('loggedInUser').then(u => {
      setIsLoggedIn(!!u);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <View style={{ flex: 1, backgroundColor: '#1a1a2e', justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#e53935" />
    </View>
  );

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName={isLoggedIn ? 'MainTabs' : 'Splash'}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login">
          {props => <LoginScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
        </Stack.Screen>
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="BrowseCatalog" component={BrowseCatalogScreen} />
        <Stack.Screen name="Reviews" component={ReviewsScreen} />
        <Stack.Screen name="AddReview" component={AddReviewScreen} />
        <Stack.Screen name="Borrowing" component={BorrowingScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
