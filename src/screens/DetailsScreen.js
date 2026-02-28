import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useWeather } from '../context/WeatherContext';
import {
  getWeatherIcon,
  getWeatherDescription,
  formatDate,
  windDirectionLabel,
  COLORS,
} from '../utils/weather';

function formatHour(isoString) {
  const d = new Date(isoString);
  const h = d.getHours();
  if (h === 0) return '12AM';
  if (h === 12) return '12PM';
  return h > 12 ? `${h - 12}PM` : `${h}AM`;
}

function formatTime(isoString) {
  if (!isoString) return '--:--';
  const d = new Date(isoString);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function DetailsScreen({ route, navigation }) {
  const { cityName } = route.params;
  const {
    cities,
    weatherData,
    loading,
    error,
    lastUpdated,
    fetchWeather,
    isFavorite,
    toggleFavorite,
  } = useWeather();

  const city = cities.find((c) => c.name === cityName);
  const data = weatherData[cityName];
  const fav = isFavorite(cityName);

  useEffect(() => {
    if (city && !data) {
      fetchWeather(city);
    }
  }, [cityName]);

  // Set header right button for favorite
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => toggleFavorite(cityName)}
          style={{ marginRight: 8 }}
        >
          <Text style={{ fontSize: 22 }}>{fav ? '⭐' : '☆'}</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, fav, cityName]);

  const handleRefresh = useCallback(() => {
    if (city) fetchWeather(city);
  }, [city]);

  if (loading && !data) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading weather data…</Text>
      </View>
    );
  }

  if (error && !data) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>⚠️ {error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={handleRefresh}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
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
  const hourly = data.hourly;
  const weatherCode = current.weather_code;

  // Get the next 24 hours of hourly data
  const now = new Date();
  const hourlySlice = [];
  if (hourly) {
    for (let i = 0; i < hourly.time.length && hourlySlice.length < 24; i++) {
      if (new Date(hourly.time[i]) >= now) {
        hourlySlice.push({
          time: hourly.time[i],
          temp: hourly.temperature_2m[i],
          code: hourly.weather_code[i],
          precip: hourly.precipitation_probability[i],
        });
      }
    }
  }

  const lastUp = lastUpdated[cityName]
    ? new Date(lastUpdated[cityName]).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={handleRefresh}
          tintColor={COLORS.primary}
          colors={[COLORS.primary]}
        />
      }
    >
      {/* Current Weather Hero */}
      <View style={styles.heroCard}>
        <Text style={styles.heroIcon}>{getWeatherIcon(weatherCode)}</Text>
        <Text style={styles.heroTemp}>
          {Math.round(current.temperature_2m)}°C
        </Text>
        <Text style={styles.heroDesc}>
          {getWeatherDescription(weatherCode)}
        </Text>
        <Text style={styles.heroFeelsLike}>
          Feels like {Math.round(current.apparent_temperature)}°C
        </Text>
        {daily && (
          <Text style={styles.heroHiLo}>
            H:{Math.round(daily.temperature_2m_max[0])}° L:
            {Math.round(daily.temperature_2m_min[0])}°
          </Text>
        )}
        {lastUp && (
          <Text style={styles.heroUpdated}>Updated at {lastUp}</Text>
        )}
      </View>

      {/* Hourly Forecast */}
      {hourlySlice.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Next 24 Hours</Text>
          <FlatList
            horizontal
            data={hourlySlice}
            keyExtractor={(item) => item.time}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hourlyList}
            renderItem={({ item }) => (
              <View style={styles.hourlyItem}>
                <Text style={styles.hourlyTime}>{formatHour(item.time)}</Text>
                <Text style={styles.hourlyIcon}>
                  {getWeatherIcon(item.code)}
                </Text>
                <Text style={styles.hourlyTemp}>
                  {Math.round(item.temp)}°
                </Text>
                {item.precip > 0 && (
                  <Text style={styles.hourlyPrecip}>💧{item.precip}%</Text>
                )}
              </View>
            )}
          />
        </>
      )}

      {/* Current Details Grid */}
      <Text style={styles.sectionTitle}>Current Conditions</Text>
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
            {windDirectionLabel(current.wind_direction_10m)}
          </Text>
          <Text style={styles.detailLabel}>Direction</Text>
        </View>
      </View>

      <View style={styles.detailsGrid}>
        <View style={styles.detailItem}>
          <Text style={styles.detailIcon}>🔵</Text>
          <Text style={styles.detailValue}>
            {current.surface_pressure
              ? `${Math.round(current.surface_pressure)} hPa`
              : '—'}
          </Text>
          <Text style={styles.detailLabel}>Pressure</Text>
        </View>
        {daily && (
          <>
            <View style={styles.detailItem}>
              <Text style={styles.detailIcon}>☀️</Text>
              <Text style={styles.detailValue}>
                {daily.uv_index_max ? daily.uv_index_max[0]?.toFixed(1) : '—'}
              </Text>
              <Text style={styles.detailLabel}>UV Index</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailIcon}>🌧️</Text>
              <Text style={styles.detailValue}>
                {daily.precipitation_sum
                  ? `${daily.precipitation_sum[0]} mm`
                  : '—'}
              </Text>
              <Text style={styles.detailLabel}>Precip.</Text>
            </View>
          </>
        )}
      </View>

      {/* Sunrise / Sunset */}
      {daily && daily.sunrise && daily.sunset && (
        <View style={styles.sunRow}>
          <View style={styles.sunItem}>
            <Text style={styles.sunIcon}>🌅</Text>
            <Text style={styles.sunLabel}>Sunrise</Text>
            <Text style={styles.sunValue}>
              {formatTime(daily.sunrise[0])}
            </Text>
          </View>
          <View style={styles.sunDivider} />
          <View style={styles.sunItem}>
            <Text style={styles.sunIcon}>🌇</Text>
            <Text style={styles.sunLabel}>Sunset</Text>
            <Text style={styles.sunValue}>
              {formatTime(daily.sunset[0])}
            </Text>
          </View>
        </View>
      )}

      {/* 7-Day Forecast */}
      <Text style={styles.sectionTitle}>7-Day Forecast</Text>
      {daily &&
        daily.time.map((date, index) => {
          const isToday = index === 0;
          return (
            <View
              key={date}
              style={[styles.forecastRow, isToday && styles.forecastToday]}
            >
              <Text style={styles.forecastDay}>
                {isToday ? 'Today' : formatDate(date)}
              </Text>
              <Text style={styles.forecastIcon}>
                {getWeatherIcon(daily.weather_code[index])}
              </Text>
              <View style={styles.forecastTemps}>
                <Text style={styles.forecastHigh}>
                  {Math.round(daily.temperature_2m_max[index])}°
                </Text>
                {/* Temperature bar */}
                <View style={styles.tempBarContainer}>
                  <View
                    style={[
                      styles.tempBar,
                      {
                        width: `${Math.max(
                          20,
                          ((daily.temperature_2m_max[index] -
                            daily.temperature_2m_min[index]) /
                            30) *
                            100
                        )}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.forecastLow}>
                  {Math.round(daily.temperature_2m_min[index])}°
                </Text>
              </View>
              <Text style={styles.forecastRain}>
                💧{daily.precipitation_sum[index]}mm
              </Text>
            </View>
          );
        })}

      {/* Coordinates */}
      <View style={styles.coordBox}>
        <Text style={styles.coordText}>
          📍 {city?.latitude?.toFixed(4)}, {city?.longitude?.toFixed(4)}
          {city?.country ? ` · ${city.country}` : ''}
        </Text>
        <Text style={styles.coordText}>
          Data from Open-Meteo API
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.warningText,
  },
  retryBtn: {
    marginTop: 16,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },

  /* Hero */
  heroCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    marginBottom: 18,
    elevation: 6,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  heroIcon: {
    fontSize: 72,
  },
  heroTemp: {
    fontSize: 56,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 4,
  },
  heroDesc: {
    fontSize: 19,
    color: '#D4E8FA',
    marginTop: 4,
    fontWeight: '500',
  },
  heroFeelsLike: {
    fontSize: 14,
    color: '#B8D4F0',
    marginTop: 6,
  },
  heroHiLo: {
    fontSize: 14,
    color: '#C8DFF5',
    marginTop: 4,
    fontWeight: '600',
  },
  heroUpdated: {
    fontSize: 11,
    color: '#A0C4E8',
    marginTop: 8,
  },

  /* Section */
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 10,
    marginTop: 6,
  },

  /* Hourly */
  hourlyList: {
    paddingBottom: 14,
  },
  hourlyItem: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 12,
    marginRight: 10,
    alignItems: 'center',
    minWidth: 68,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
  },
  hourlyTime: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  hourlyIcon: {
    fontSize: 24,
    marginVertical: 6,
  },
  hourlyTemp: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  hourlyPrecip: {
    fontSize: 10,
    color: COLORS.primary,
    marginTop: 3,
  },

  /* Details Grid */
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailItem: {
    flex: 1,
    backgroundColor: COLORS.card,
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
    fontSize: 22,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 6,
    textAlign: 'center',
  },
  detailLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  /* Sun row */
  sunRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    marginTop: 6,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  sunItem: {
    flex: 1,
    alignItems: 'center',
  },
  sunDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E0E8F0',
  },
  sunIcon: {
    fontSize: 26,
  },
  sunLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  sunValue: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 2,
  },

  /* Forecast */
  forecastRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 13,
    marginBottom: 6,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
  },
  forecastToday: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  forecastDay: {
    width: 60,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  forecastIcon: {
    fontSize: 22,
    width: 36,
    textAlign: 'center',
  },
  forecastTemps: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 4,
  },
  forecastHigh: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.danger,
    width: 32,
    textAlign: 'right',
  },
  forecastLow: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    width: 32,
  },
  tempBarContainer: {
    flex: 1,
    height: 4,
    backgroundColor: '#E8F0F8',
    borderRadius: 2,
  },
  tempBar: {
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.accent,
  },
  forecastRain: {
    fontSize: 11,
    color: COLORS.textSecondary,
    width: 58,
    textAlign: 'right',
  },

  /* Coordinates */
  coordBox: {
    marginTop: 16,
    alignItems: 'center',
    paddingBottom: 8,
  },
  coordText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
});
