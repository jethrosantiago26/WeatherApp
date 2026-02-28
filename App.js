import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { WeatherProvider } from './src/context/WeatherContext';
import HomeScreen from './src/screens/HomeScreen';
import DetailsScreen from './src/screens/DetailsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <WeatherProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
              headerStyle: { backgroundColor: '#4A90D9' },
              headerTintColor: '#FFFFFF',
              headerTitleStyle: { fontWeight: '700', fontSize: 18 },
              headerShadowVisible: false,
              contentStyle: { backgroundColor: '#E6F4FE' },
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Details"
              component={DetailsScreen}
              options={({ route }) => ({
                title: route.params?.cityName || 'Weather Details',
                headerBackTitle: 'Back',
              })}
            />
          </Stack.Navigator>
          <StatusBar style="auto" />
        </NavigationContainer>
      </WeatherProvider>
    </SafeAreaProvider>
  );
}
