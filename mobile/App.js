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
<<<<<<< HEAD
import CancelOrderScreen from './src/screens/CancelOrderScreen';
import OrderHistoryScreen from './src/screens/OrderHistoryScreen';
import ProductReviewsScreen from './src/screens/ProductReviewsScreen';
import WriteReviewScreen from './src/screens/WriteReviewScreen';
import HomeScreen from './src/screens/HomeScreen';
import CategoriesScreen from './src/screens/CategoriesScreen';
import CartScreen from './src/screens/CartScreen'; 
import ProductDetailScreen from './src/screens/ProductDetailScreen';
import OrderDetailScreen from './src/screens/OrderDetailScreen';
=======
import DetailProduct from './src/screens/DetailProduct';
>>>>>>> origin/long

const Stack = createStackNavigator();

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
<<<<<<< HEAD
      const token = await AsyncStorage.getItem('token');
      setInitialRoute(token ? 'Home' : 'Login');
=======
      // Start app directly at DetailProduct
      setInitialRoute('DetailProduct');
>>>>>>> origin/long
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
<<<<<<< HEAD
        <Stack.Screen name="CancelOrder" component={CancelOrderScreen} />
        <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
        <Stack.Screen name="ProductReviews" component={ProductReviewsScreen} />
        <Stack.Screen name="WriteReview" component={WriteReviewScreen} />
=======
      </Stack.Navigator>
    </NavigationContainer>
  );
}
>>>>>>> origin/long
