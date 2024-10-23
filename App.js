import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screen/HomeScreen';
import SignupScreen from './screen/SignupScreen';
import LoginScreen from './screen/LoginScreen';
import TripsScreen from './screen/TripsScreen';
import NewTripScreen from './screen/NewTripScreen';
import UserTripsScreen from './screen/UserTripsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Trips" component={TripsScreen} />
        <Stack.Screen name="NewTrip" component={NewTripScreen} />
        <Stack.Screen name="UserTrips" component={UserTripsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}