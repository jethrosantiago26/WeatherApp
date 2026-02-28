import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
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
  Modal,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWeather } from '../context/WeatherContext';
import {
  getWeatherIcon,
  getWeatherDescription,
  formatTemp,
  formatTempShort,
  timeAgo,
  COLORS,
} from '../utils/weather';

/* ---------- Skeleton shimmer card ---------- */
function SkeletonCard() {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.7] });
  return (
    <View style={styles.card}>
      <View style={styles.cardBody}>
        <View style={styles.cardLeft}>
          <Animated.View style={[styles.skelBar, { width: 120, opacity }]} />
          <Animated.View style={[styles.skelBar, { width: 90, marginTop: 8, opacity }]} />
          <Animated.View style={[styles.skelBar, { width: 60, marginTop: 6, opacity }]} />
        </View>
        <View style={styles.cardRight}>
          <Animated.View style={[styles.skelCircle, { opacity }]} />
          <Animated.View style={[styles.skelBar, { width: 50, marginTop: 8, opacity }]} />
        </View>
      </View>
    </View>
  );
}

/* ---------- Add‑City Modal ---------- */
function AddCityModal({ visible, onClose }) {
  const {
    searchResults,
    searching,
    searchCities,
    addCustomCity,
    clearSearchResults,
    fetchWeather,
    cities,
  } = useWeather();
  const [query, setQuery] = useState('');
  const timer = useRef(null);

  const handleChange = (text) => {
    setQuery(text);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => searchCities(text), 350);
  };

  const handleAdd = (result) => {
    const city = {
      name: result.name,
      latitude: result.latitude,
      longitude: result.longitude,
      country: result.country,
      admin: result.admin,
    };
    addCustomCity(city);
    fetchWeather(city);
    setQuery('');
    clearSearchResults();
    onClose();
  };

  const handleClose = () => {
    setQuery('');
    clearSearchResults();
    onClose();
  };

  const alreadyAdded = (name) => cities.some((c) => c.name === name);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add City</Text>
            <TouchableOpacity onPress={handleClose}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.modalSearchBox}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search worldwide..."
              placeholderTextColor={COLORS.textMuted}
              value={query}
              onChangeText={handleChange}
              autoFocus
              autoCorrect={false}
              returnKeyType="search"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => { setQuery(''); clearSearchResults(); }}>
                <Text style={styles.clearSearch}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {searching && (
            <ActivityIndicator style={{ marginTop: 20 }} color={COLORS.primary} />
          )}

          <FlatList
            data={searchResults}
            keyExtractor={(r, i) => `${r.name}-${r.latitude}-${i}`}
            keyboardShouldPersistTaps="handled"
            style={{ maxHeight: 320 }}
            renderItem={({ item }) => {
              const added = alreadyAdded(item.name);
              return (
                <TouchableOpacity
                  style={styles.resultRow}
                  onPress={() => !added && handleAdd(item)}
                  disabled={added}
                  activeOpacity={0.7}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.resultName, added && { color: COLORS.textMuted }]}>
                      {item.name}
                    </Text>
                    <Text style={styles.resultSub}>
                      {[item.admin, item.country].filter(Boolean).join(', ')}
                    </Text>
                  </View>
                  {added ? (
                    <Text style={styles.addedLabel}>Added</Text>
                  ) : (
                    <Text style={styles.addBtn}>+</Text>
                  )}
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              query.length >= 2 && !searching ? (
                <Text style={styles.noResults}>No cities found</Text>
              ) : query.length < 2 && query.length > 0 ? (
                <Text style={styles.noResults}>Type at least 2 characters</Text>
              ) : null
            }
          />
        </View>
      </View>
    </Modal>
  );
}

/* ---------- Home Screen ---------- */
export default function HomeScreen({ navigation }) {
  const {
    cities,
    weatherData,
    loading,
    error,
    favorites,
    lastUpdated,
    unit,
    isCustomCity,
    fetchWeather,
    selectCity,
    toggleFavorite,
    isFavorite,
    clearError,
  } = useWeather();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddCity, setShowAddCity] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    const promises = cities.map((city) => {
      if (!weatherData[city.name]) return fetchWeather(city);
      return Promise.resolve();
    });
    Promise.all(promises).then(() => setInitialLoad(false));
  }, [cities.length]);

  // Sort: favorites first, custom cities tagged, then alphabetical; filter by search
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
      if (!weatherData[city.name]) fetchWeather(city);
      navigation.navigate('Details', { cityName: city.name });
    },
    [weatherData]
  );

  const renderCityCard = ({ item: city }) => {
    const data = weatherData[city.name];
    const current = data?.current;
    const daily = data?.daily;
    const weatherCode = current?.weather_code ?? 0;
    const fav = isFavorite(city.name);
    const custom = isCustomCity(city.name);

    if (!current && initialLoad) return <SkeletonCard />;

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
              <Text style={styles.cityName} numberOfLines={1}>
                {city.name}
              </Text>
              <Text style={[styles.countryBadge, custom && styles.customBadge]}>
                {custom ? '📌 ' : ''}{city.country}
              </Text>
            </View>
            {current ? (
              <>
                <Text style={styles.weatherDesc}>
                  {getWeatherDescription(weatherCode)}
                </Text>
                {daily && (
                  <Text style={styles.hiLo}>
                    H:{formatTempShort(daily.temperature_2m_max[0], unit)} L:
                    {formatTempShort(daily.temperature_2m_min[0], unit)}
                  </Text>
                )}
              </>
            ) : (
              <Text style={styles.weatherDesc}>Loading...</Text>
            )}
            {lastUpdated[city.name] && (
              <Text style={styles.updatedText}>
                {timeAgo(lastUpdated[city.name])}
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
                  {formatTemp(current.temperature_2m, unit)}
                </Text>
                <Text style={styles.feelsLike}>
                  Feels {formatTempShort(current.apparent_temperature, unit)}
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
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.header}>🌍 Weather</Text>
            <Text style={styles.subtitle}>
              {cities.length} cities · {favorites.length} favorites
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => setShowAddCity(true)}
              style={styles.headerBtn}
            >
              <Text style={styles.headerBtnText}>＋</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('Settings')}
              style={styles.headerBtn}
            >
              <Text style={styles.headerBtnIcon}>⚙️</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Filter cities..."
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

      {/* Add City Modal */}
      <AddCityModal
        visible={showAddCity}
        onClose={() => setShowAddCity(false)}
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  headerBtnText: {
    fontSize: 22,
    color: COLORS.primary,
    fontWeight: '600',
    lineHeight: 26,
  },
  headerBtnIcon: {
    fontSize: 18,
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
    flexShrink: 1,
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
  customBadge: {
    backgroundColor: '#FFF3E0',
    color: '#E67E22',
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

  /* Skeleton */
  skelBar: {
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.skeleton,
  },
  skelCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.skeleton,
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

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  modalClose: {
    fontSize: 20,
    color: COLORS.textSecondary,
    padding: 4,
  },
  modalSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.settingsBg,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  resultSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  addedLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  addBtn: {
    fontSize: 24,
    color: COLORS.primary,
    fontWeight: '700',
  },
  noResults: {
    textAlign: 'center',
    padding: 20,
    color: COLORS.textSecondary,
    fontSize: 14,
  },
});
