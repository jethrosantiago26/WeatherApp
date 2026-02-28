import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useWeather } from '../context/WeatherContext';

const WEATHER_DESCRIPTIONS = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Foggy',
  48: 'Rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  71: 'Slight snow',
  73: 'Moderate snow',
  75: 'Heavy snow',
  80: 'Slight showers',
  81: 'Moderate showers',
  82: 'Violent showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm w/ hail',
  99: 'Thunderstorm w/ heavy hail',
};

const WEATHER_ICONS = {
  0: '☀️',
  1: '🌤️',
  2: '⛅',
  3: '☁️',
  45: '🌫️',
  48: '🌫️',
  51: '🌦️',
  53: '🌧️',
  55: '🌧️',
  61: '🌧️',
  63: '🌧️',
  65: '🌧️',
  71: '🌨️',
  73: '🌨️',
  75: '❄️',
  80: '🌦️',
  81: '🌧️',
  82: '⛈️',
  95: '⛈️',
  96: '⛈️',
  99: '⛈️',
};

export default function HomeScreen({ navigation }) {
  const { cities, weatherData, loading, error, fetchWeather, selectCity } =
    useWeather();

  useEffect(() => {
    cities.forEach((city) => {
      if (!weatherData[city.name]) {
        fetchWeather(city);
      }
    });
  }, []);

  const handleRefresh = () => {
    cities.forEach((city) => fetchWeather(city));
  };

  const handleCityPress = (city) => {
    selectCity(city);
    if (!weatherData[city.name]) {
      fetchWeather(city);
    }
    navigation.navigate('Details', { cityName: city.name });
  };

  const renderCityCard = ({ item: city }) => {
    const data = weatherData[city.name];
    const current = data?.current;
    const weatherCode = current?.weather_code ?? 0;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleCityPress(city)}
        activeOpacity={0.7}
      >
        <View style={styles.cardLeft}>
          <Text style={styles.cityName}>{city.name}</Text>
          {current ? (
            <Text style={styles.weatherDesc}>
              {WEATHER_DESCRIPTIONS[weatherCode] || 'Unknown'}
            </Text>
          ) : (
            <Text style={styles.weatherDesc}>Loading...</Text>
          )}
        </View>
        <View style={styles.cardRight}>
          {current ? (
            <>
              <Text style={styles.weatherIcon}>
                {WEATHER_ICONS[weatherCode] || '🌡️'}
              </Text>
              <Text style={styles.temperature}>
                {Math.round(current.temperature_2m)}°C
              </Text>
            </>
          ) : (
            <ActivityIndicator size="small" color="#4A90D9" />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🌍 Weather App</Text>
      <Text style={styles.subtitle}>Tap a city for detailed forecast</Text>

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      )}

      <FlatList
        data={cities}
        keyExtractor={(item) => item.name}
        renderItem={renderCityCard}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={handleRefresh}
            tintColor="#4A90D9"
            colors={['#4A90D9']}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6F4FE',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A3A5C',
    textAlign: 'center',
    paddingTop: 16,
    paddingBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B8DAF',
    textAlign: 'center',
    marginBottom: 12,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardLeft: {
    flex: 1,
  },
  cityName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A3A5C',
  },
  weatherDesc: {
    fontSize: 13,
    color: '#7BA3C7',
    marginTop: 4,
  },
  cardRight: {
    alignItems: 'center',
    minWidth: 70,
  },
  weatherIcon: {
    fontSize: 32,
  },
  temperature: {
    fontSize: 22,
    fontWeight: '700',
    color: '#4A90D9',
    marginTop: 2,
  },
  errorBox: {
    backgroundColor: '#FFF3CD',
    padding: 10,
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  errorText: {
    color: '#856404',
    textAlign: 'center',
    fontSize: 13,
  },
});
