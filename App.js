import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WeatherProvider } from './src/context/WeatherContext';
import HomeScreen from './src/screens/HomeScreen';
import DetailsScreen from './src/screens/DetailsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <WeatherProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: { backgroundColor: '#4A90D9' },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: { fontWeight: '700' },
            contentStyle: { backgroundColor: '#E6F4FE' },
          }}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: 'Weather App', headerShown: false }}
          />
          <Stack.Screen
            name="Details"
            component={DetailsScreen}
            options={({ route }) => ({
              title: route.params?.cityName || 'Weather Details',
            })}
          />
        </Stack.Navigator>
        <StatusBar style="light" />
      </NavigationContainer>
    </WeatherProvider>
  );
}
