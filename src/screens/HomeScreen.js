import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWeather } from '../context/WeatherContext';
import {
  getWeatherIcon,
  getWeatherDescription,
  COLORS,
} from '../utils/weather';

export default function HomeScreen({ navigation }) {
  const {
    cities,
    weatherData,
    loading,
    error,
    favorites,
    lastUpdated,
    fetchWeather,
    selectCity,
    toggleFavorite,
    isFavorite,
    clearError,
  } = useWeather();

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    cities.forEach((city) => {
      if (!weatherData[city.name]) {
        fetchWeather(city);
      }
    });
  }, []);

  // Sort: favorites first, then alphabetical; filter by search
  const filteredCities = useMemo(() => {
    let list = [...cities];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.country.toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      const aFav = favorites.includes(a.name) ? 0 : 1;
      const bFav = favorites.includes(b.name) ? 0 : 1;
      if (aFav !== bFav) return aFav - bFav;
      return a.name.localeCompare(b.name);
    });
    return list;
  }, [cities, searchQuery, favorites]);

  const handleRefresh = useCallback(() => {
    clearError();
    cities.forEach((city) => fetchWeather(city));
  }, [cities]);

  const handleCityPress = useCallback(
    (city) => {
      selectCity(city);
      if (!weatherData[city.name]) {
        fetchWeather(city);
      }
      navigation.navigate('Details', { cityName: city.name });
    },
    [weatherData]
  );

  const formatLastUpdated = (cityName) => {
    const ts = lastUpdated[cityName];
    if (!ts) return '';
    const d = new Date(ts);
    const now = new Date();
    const diffMin = Math.round((now - d) / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHrs = Math.round(diffMin / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return `${Math.round(diffHrs / 24)}d ago`;
  };

  const renderCityCard = ({ item: city }) => {
    const data = weatherData[city.name];
    const current = data?.current;
    const daily = data?.daily;
    const weatherCode = current?.weather_code ?? 0;
    const fav = isFavorite(city.name);

    return (
      <TouchableOpacity
        style={[styles.card, fav && styles.cardFavorite]}
        onPress={() => handleCityPress(city)}
        activeOpacity={0.7}
      >
        {/* Favorite badge */}
        <TouchableOpacity
          style={styles.favButton}
          onPress={() => toggleFavorite(city.name)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.favIcon}>{fav ? '⭐' : '☆'}</Text>
        </TouchableOpacity>

        <View style={styles.cardBody}>
          <View style={styles.cardLeft}>
            <View style={styles.cityRow}>
              <Text style={styles.cityName}>{city.name}</Text>
              <Text style={styles.countryBadge}>{city.country}</Text>
            </View>
            {current ? (
              <>
                <Text style={styles.weatherDesc}>
                  {getWeatherDescription(weatherCode)}
                </Text>
                {daily && (
                  <Text style={styles.hiLo}>
                    H:{Math.round(daily.temperature_2m_max[0])}° L:
                    {Math.round(daily.temperature_2m_min[0])}°
                  </Text>
                )}
              </>
            ) : (
              <Text style={styles.weatherDesc}>Loading...</Text>
            )}
            {lastUpdated[city.name] && (
              <Text style={styles.updatedText}>
                {formatLastUpdated(city.name)}
              </Text>
            )}
          </View>
          <View style={styles.cardRight}>
            {current ? (
              <>
                <Text style={styles.weatherIcon}>
                  {getWeatherIcon(weatherCode)}
                </Text>
                <Text style={styles.temperature}>
                  {Math.round(current.temperature_2m)}°C
                </Text>
                <Text style={styles.feelsLike}>
                  Feels {Math.round(current.apparent_temperature)}°
                </Text>
              </>
            ) : (
              <ActivityIndicator size="small" color={COLORS.primary} />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.header}>🌍 Weather</Text>
        <Text style={styles.subtitle}>
          {cities.length} cities · {favorites.length} favorites
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search cities..."
          placeholderTextColor={COLORS.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCorrect={false}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={styles.clearSearch}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Error Banner */}
      {error && (
        <TouchableOpacity style={styles.errorBox} onPress={clearError}>
          <Text style={styles.errorText}>⚠️ {error} — Tap to dismiss</Text>
        </TouchableOpacity>
      )}

      {/* No Results */}
      {filteredCities.length === 0 && searchQuery.trim() !== '' && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyText}>
            No cities match "{searchQuery}"
          </Text>
        </View>
      )}

      {/* City List */}
      <FlatList
        data={filteredCities}
        keyExtractor={(item) => item.name}
        renderItem={renderCityCard}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  header: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  /* Search */
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
    paddingVertical: 0,
  },
  clearSearch: {
    fontSize: 18,
    color: COLORS.textMuted,
    paddingLeft: 8,
  },

  /* List */
  list: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 24,
  },

  /* Card */
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 0,
  },
  cardFavorite: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent,
  },
  favButton: {
    position: 'absolute',
    top: 8,
    right: 10,
    zIndex: 1,
  },
  favIcon: {
    fontSize: 18,
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLeft: {
    flex: 1,
    paddingRight: 8,
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cityName: {
    fontSize: 19,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  countryBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
    backgroundColor: '#E0EFFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  weatherDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 3,
  },
  hiLo: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  updatedText: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 3,
  },
  cardRight: {
    alignItems: 'center',
    minWidth: 75,
  },
  weatherIcon: {
    fontSize: 34,
  },
  temperature: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 2,
  },
  feelsLike: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
  },

  /* Error */
  errorBox: {
    backgroundColor: COLORS.warning,
    padding: 10,
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  errorText: {
    color: COLORS.warningText,
    textAlign: 'center',
    fontSize: 13,
  },

  /* Empty */
  emptyState: {
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
});
