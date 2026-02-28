import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWeather } from '../context/WeatherContext';
import { COLORS } from '../utils/weather';

export default function SettingsScreen() {
  const {
    unit,
    setUnit,
    favorites,
    customCities,
    removeCustomCity,
    toggleFavorite,
    cities,
  } = useWeather();

  const handleRemoveCity = (cityName) => {
    Alert.alert(
      'Remove City',
      `Remove "${cityName}" from your city list?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeCustomCity(cityName),
        },
      ]
    );
  };

  const favoriteCities = cities.filter((c) => favorites.includes(c.name));

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Temperature Unit */}
        <Text style={styles.sectionTitle}>Temperature Unit</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={[
              styles.unitOption,
              unit === 'celsius' && styles.unitOptionActive,
            ]}
            onPress={() => setUnit('celsius')}
            activeOpacity={0.7}
          >
            <Text style={styles.unitEmoji}>🌡️</Text>
            <View style={styles.unitText}>
              <Text
                style={[
                  styles.unitLabel,
                  unit === 'celsius' && styles.unitLabelActive,
                ]}
              >
                Celsius
              </Text>
              <Text style={styles.unitExample}>25°C</Text>
            </View>
            {unit === 'celsius' && <Text style={styles.check}>✓</Text>}
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={[
              styles.unitOption,
              unit === 'fahrenheit' && styles.unitOptionActive,
            ]}
            onPress={() => setUnit('fahrenheit')}
            activeOpacity={0.7}
          >
            <Text style={styles.unitEmoji}>🌡️</Text>
            <View style={styles.unitText}>
              <Text
                style={[
                  styles.unitLabel,
                  unit === 'fahrenheit' && styles.unitLabelActive,
                ]}
              >
                Fahrenheit
              </Text>
              <Text style={styles.unitExample}>77°F</Text>
            </View>
            {unit === 'fahrenheit' && <Text style={styles.check}>✓</Text>}
          </TouchableOpacity>
        </View>

        {/* Favorites */}
        <Text style={styles.sectionTitle}>
          Favorites ({favoriteCities.length})
        </Text>
        <View style={styles.card}>
          {favoriteCities.length === 0 ? (
            <Text style={styles.emptyText}>
              No favorites yet. Tap the ★ icon on any city to add it.
            </Text>
          ) : (
            favoriteCities.map((city, idx) => (
              <View key={city.name}>
                {idx > 0 && <View style={styles.divider} />}
                <View style={styles.listRow}>
                  <Text style={styles.cityFlag}>
                    {city.country === 'US'
                      ? '🇺🇸'
                      : city.country === 'GB'
                      ? '🇬🇧'
                      : city.country === 'JP'
                      ? '🇯🇵'
                      : city.country === 'AU'
                      ? '🇦🇺'
                      : city.country === 'FR'
                      ? '🇫🇷'
                      : city.country === 'AE'
                      ? '🇦🇪'
                      : city.country === 'BR'
                      ? '🇧🇷'
                      : city.country === 'IN'
                      ? '🇮🇳'
                      : city.country === 'DE'
                      ? '🇩🇪'
                      : city.country === 'CA'
                      ? '🇨🇦'
                      : city.country === 'KR'
                      ? '🇰🇷'
                      : city.country === 'SG'
                      ? '🇸🇬'
                      : '🌍'}
                  </Text>
                  <Text style={styles.cityName} numberOfLines={1}>
                    {city.name}
                  </Text>
                  <TouchableOpacity
                    onPress={() => toggleFavorite(city.name)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={styles.removeStar}>★</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Custom Cities */}
        {customCities.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>
              Custom Cities ({customCities.length})
            </Text>
            <View style={styles.card}>
              {customCities.map((city, idx) => (
                <View key={city.name}>
                  {idx > 0 && <View style={styles.divider} />}
                  <View style={styles.listRow}>
                    <Text style={styles.cityFlag}>🌍</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cityName} numberOfLines={1}>
                        {city.name}
                      </Text>
                      {city.admin ? (
                        <Text style={styles.cityAdmin}>{city.admin}, {city.country}</Text>
                      ) : null}
                    </View>
                    <TouchableOpacity
                      onPress={() => handleRemoveCity(city.name)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Text style={styles.removeBtn}>✕</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {/* About */}
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.card}>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Data Source</Text>
            <Text style={styles.aboutValue}>Open-Meteo API</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Version</Text>
            <Text style={styles.aboutValue}>2.0.0</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          Weather data provided by Open-Meteo.com{'\n'}Free & open-source weather API
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.settingsBg,
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 24,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  unitOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  unitOptionActive: {
    backgroundColor: '#EBF5FF',
  },
  unitEmoji: {
    fontSize: 22,
    marginRight: 12,
  },
  unitText: {
    flex: 1,
  },
  unitLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  unitLabelActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  unitExample: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  check: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.border,
    marginLeft: 50,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  cityFlag: {
    fontSize: 20,
    marginRight: 12,
  },
  cityName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  cityAdmin: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  removeStar: {
    fontSize: 20,
    color: COLORS.accent,
  },
  removeBtn: {
    fontSize: 16,
    color: COLORS.danger,
    fontWeight: '700',
    paddingHorizontal: 4,
  },
  emptyText: {
    padding: 16,
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  aboutLabel: {
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  aboutValue: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  footer: {
    textAlign: 'center',
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 24,
    lineHeight: 18,
  },
});
