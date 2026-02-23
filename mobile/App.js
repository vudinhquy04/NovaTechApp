import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ChangePasswordScreen from './src/screens/ChangePasswordScreen';
import CancelOrderScreen from './src/screens/CancelOrderScreen';
import OrderHistoryScreen from './src/screens/OrderHistoryScreen';
import ProductReviewsScreen from './src/screens/ProductReviewsScreen';
import WriteReviewScreen from './src/screens/WriteReviewScreen';
import HomeScreen from './src/screens/HomeScreen';
import CategoriesScreen from './src/screens/CategoriesScreen';
import CartScreen from './src/screens/CartScreen'; 
import ProductDetailScreen from './src/screens/ProductDetailScreen';
import OrderDetailScreen from './src/screens/OrderDetailScreen';
import DetailProduct from './src/screens/DetailProduct';
import NotificationScreen from './src/screens/NotificationScreen';
import NotificationDetailScreen from './src/screens/NotificationDetailScreen';
import AddressScreen from './src/screens/AddressScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import SupportScreen from './src/screens/SupportScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import TrackOrderScreen from './src/screens/TrackOrderScreen';

const Stack = createStackNavigator();

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      // Always start from Login for proper flow
      setInitialRoute('Login');
    };
    checkAuth();
  }, []);

  if (initialRoute === null) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
        initialRouteName={initialRoute}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Categories" component={CategoriesScreen} />
        <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
        <Stack.Screen name="Cart" component={CartScreen} />
        <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="DetailProduct" component={DetailProduct} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
        <Stack.Screen name="CancelOrder" component={CancelOrderScreen} />
        <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
        <Stack.Screen name="ProductReviews" component={ProductReviewsScreen} />
        <Stack.Screen name="WriteReview" component={WriteReviewScreen} />
        <Stack.Screen name="Notifications" component={NotificationScreen} />
        <Stack.Screen name="NotificationDetail" component={NotificationDetailScreen} />
        <Stack.Screen name="Address" component={AddressScreen} />
        <Stack.Screen name="Checkout" component={CheckoutScreen} />
        <Stack.Screen name="Favorites" component={FavoritesScreen} />
        <Stack.Screen name="Support" component={SupportScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="TrackOrder" component={TrackOrderScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
