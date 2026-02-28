import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
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

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return `${DAY_NAMES[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}`;
}

function windDirection(deg) {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8];
}

export default function DetailsScreen({ route }) {
  const { cityName } = route.params;
  const { cities, weatherData, loading, error, fetchWeather } = useWeather();

  const city = cities.find((c) => c.name === cityName);
  const data = weatherData[cityName];

  useEffect(() => {
    if (city && !data) {
      fetchWeather(city);
    }
  }, [cityName]);

  if (loading && !data) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4A90D9" />
        <Text style={styles.loadingText}>Loading weather data…</Text>
      </View>
    );
  }

  if (error && !data) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>⚠️ {error}</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>No data available</Text>
      </View>
    );
  }

  const current = data.current;
  const daily = data.daily;
  const weatherCode = current.weather_code;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Current Weather Hero */}
      <View style={styles.heroCard}>
        <Text style={styles.heroIcon}>
          {WEATHER_ICONS[weatherCode] || '🌡️'}
        </Text>
        <Text style={styles.heroTemp}>
          {Math.round(current.temperature_2m)}°C
        </Text>
        <Text style={styles.heroDesc}>
          {WEATHER_DESCRIPTIONS[weatherCode] || 'Unknown'}
        </Text>
        <Text style={styles.heroFeelsLike}>
          Feels like {Math.round(current.apparent_temperature)}°C
        </Text>
      </View>

      {/* Current Details Grid */}
      <View style={styles.detailsGrid}>
        <View style={styles.detailItem}>
          <Text style={styles.detailIcon}>💧</Text>
          <Text style={styles.detailValue}>
            {current.relative_humidity_2m}%
          </Text>
          <Text style={styles.detailLabel}>Humidity</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailIcon}>💨</Text>
          <Text style={styles.detailValue}>
            {Math.round(current.wind_speed_10m)} km/h
          </Text>
          <Text style={styles.detailLabel}>Wind</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailIcon}>🧭</Text>
          <Text style={styles.detailValue}>
            {windDirection(current.wind_direction_10m)}
          </Text>
          <Text style={styles.detailLabel}>Direction</Text>
        </View>
      </View>

      {/* 5-Day Forecast */}
      <Text style={styles.sectionTitle}>5-Day Forecast</Text>
      {daily &&
        daily.time.map((date, index) => (
          <View key={date} style={styles.forecastRow}>
            <Text style={styles.forecastDay}>{formatDate(date)}</Text>
            <Text style={styles.forecastIcon}>
              {WEATHER_ICONS[daily.weather_code[index]] || '🌡️'}
            </Text>
            <View style={styles.forecastTemps}>
              <Text style={styles.forecastHigh}>
                {Math.round(daily.temperature_2m_max[index])}°
              </Text>
              <Text style={styles.forecastLow}>
                {Math.round(daily.temperature_2m_min[index])}°
              </Text>
            </View>
            <Text style={styles.forecastRain}>
              💧 {daily.precipitation_sum[index]} mm
            </Text>
          </View>
        ))}

      {/* Coordinates */}
      <View style={styles.coordBox}>
        <Text style={styles.coordText}>
          📍 {city?.latitude?.toFixed(4)}, {city?.longitude?.toFixed(4)}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6F4FE',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E6F4FE',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B8DAF',
  },
  errorText: {
    fontSize: 16,
    color: '#856404',
  },

  /* Hero */
  heroCard: {
    backgroundColor: '#4A90D9',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  heroIcon: {
    fontSize: 64,
  },
  heroTemp: {
    fontSize: 52,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 4,
  },
  heroDesc: {
    fontSize: 18,
    color: '#D4E8FA',
    marginTop: 4,
  },
  heroFeelsLike: {
    fontSize: 14,
    color: '#B8D4F0',
    marginTop: 6,
  },

  /* Details Grid */
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  detailItem: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 4,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  detailIcon: {
    fontSize: 24,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A3A5C',
    marginTop: 6,
  },
  detailLabel: {
    fontSize: 12,
    color: '#7BA3C7',
    marginTop: 2,
  },

  /* Forecast */
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A3A5C',
    marginBottom: 10,
  },
  forecastRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
  },
  forecastDay: {
    width: 70,
    fontSize: 14,
    fontWeight: '600',
    color: '#1A3A5C',
  },
  forecastIcon: {
    fontSize: 24,
    width: 40,
    textAlign: 'center',
  },
  forecastTemps: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  forecastHigh: {
    fontSize: 16,
    fontWeight: '700',
    color: '#D94A4A',
  },
  forecastLow: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A90D9',
  },
  forecastRain: {
    fontSize: 12,
    color: '#6B8DAF',
    width: 70,
    textAlign: 'right',
  },

  /* Coordinates */
  coordBox: {
    marginTop: 12,
    alignItems: 'center',
  },
  coordText: {
    fontSize: 12,
    color: '#99B5CC',
  },
});
