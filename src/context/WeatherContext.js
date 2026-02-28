import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WeatherContext = createContext();

const STORAGE_FAVORITES = '@weather_favorites';
const STORAGE_UNIT = '@weather_unit';
const STORAGE_CUSTOM_CITIES = '@weather_custom_cities';

const DEFAULT_CITIES = [
  { name: 'New York', latitude: 40.7128, longitude: -74.006, country: 'US' },
  { name: 'London', latitude: 51.5074, longitude: -0.1278, country: 'GB' },
  { name: 'Tokyo', latitude: 35.6762, longitude: 139.6503, country: 'JP' },
  { name: 'Sydney', latitude: -33.8688, longitude: 151.2093, country: 'AU' },
  { name: 'Paris', latitude: 48.8566, longitude: 2.3522, country: 'FR' },
  { name: 'Dubai', latitude: 25.2048, longitude: 55.2708, country: 'AE' },
  { name: 'São Paulo', latitude: -23.5505, longitude: -46.6333, country: 'BR' },
  { name: 'Mumbai', latitude: 19.076, longitude: 72.8777, country: 'IN' },
  { name: 'Berlin', latitude: 52.52, longitude: 13.405, country: 'DE' },
  { name: 'Toronto', latitude: 43.6532, longitude: -79.3832, country: 'CA' },
  { name: 'Seoul', latitude: 37.5665, longitude: 126.978, country: 'KR' },
  { name: 'Singapore', latitude: 1.3521, longitude: 103.8198, country: 'SG' },
];

const initialState = {
  cities: DEFAULT_CITIES,
  customCities: [],
  weatherData: {},
  selectedCity: null,
  favorites: [],
  loading: false,
  error: null,
  lastUpdated: {},
  unit: 'celsius', // 'celsius' | 'fahrenheit'
  searchResults: [],
  searching: false,
};

function weatherReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: true, error: null };
    case 'SET_WEATHER':
      return {
        ...state,
        loading: false,
        weatherData: {
          ...state.weatherData,
          [action.payload.cityName]: action.payload.data,
        },
        lastUpdated: {
          ...state.lastUpdated,
          [action.payload.cityName]: new Date().toISOString(),
        },
      };
    case 'SET_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'SELECT_CITY':
      return { ...state, selectedCity: action.payload };
    case 'SET_FAVORITES':
      return { ...state, favorites: action.payload };
    case 'TOGGLE_FAVORITE': {
      const cityName = action.payload;
      const isFav = state.favorites.includes(cityName);
      const newFavorites = isFav
        ? state.favorites.filter((f) => f !== cityName)
        : [...state.favorites, cityName];
      return { ...state, favorites: newFavorites };
    }
    case 'SET_UNIT':
      return { ...state, unit: action.payload };
    case 'SET_CUSTOM_CITIES':
      return {
        ...state,
        customCities: action.payload,
        cities: [...DEFAULT_CITIES, ...action.payload],
      };
    case 'ADD_CUSTOM_CITY': {
      const exists = state.cities.some(
        (c) => c.name === action.payload.name
      );
      if (exists) return state;
      const newCustom = [...state.customCities, action.payload];
      return {
        ...state,
        customCities: newCustom,
        cities: [...DEFAULT_CITIES, ...newCustom],
      };
    }
    case 'REMOVE_CUSTOM_CITY': {
      const newCustom = state.customCities.filter(
        (c) => c.name !== action.payload
      );
      const newWeatherData = { ...state.weatherData };
      delete newWeatherData[action.payload];
      return {
        ...state,
        customCities: newCustom,
        cities: [...DEFAULT_CITIES, ...newCustom],
        weatherData: newWeatherData,
        favorites: state.favorites.filter((f) => f !== action.payload),
      };
    }
    case 'SET_SEARCHING':
      return { ...state, searching: action.payload };
    case 'SET_SEARCH_RESULTS':
      return { ...state, searchResults: action.payload, searching: false };
    default:
      return state;
  }
}

export function WeatherProvider({ children }) {
  const [state, dispatch] = useReducer(weatherReducer, initialState);

  // Load persisted data on mount
  useEffect(() => {
    (async () => {
      try {
        const [favStored, unitStored, citiesStored] = await Promise.all([
          AsyncStorage.getItem(STORAGE_FAVORITES),
          AsyncStorage.getItem(STORAGE_UNIT),
          AsyncStorage.getItem(STORAGE_CUSTOM_CITIES),
        ]);
        if (favStored) {
          dispatch({ type: 'SET_FAVORITES', payload: JSON.parse(favStored) });
        }
        if (unitStored) {
          dispatch({ type: 'SET_UNIT', payload: unitStored });
        }
        if (citiesStored) {
          dispatch({
            type: 'SET_CUSTOM_CITIES',
            payload: JSON.parse(citiesStored),
          });
        }
      } catch (e) {
        // Ignore storage read errors
      }
    })();
  }, []);

  // Persist favorites
  useEffect(() => {
    AsyncStorage.setItem(
      STORAGE_FAVORITES,
      JSON.stringify(state.favorites)
    ).catch(() => {});
  }, [state.favorites]);

  // Persist unit
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_UNIT, state.unit).catch(() => {});
  }, [state.unit]);

  // Persist custom cities
  useEffect(() => {
    AsyncStorage.setItem(
      STORAGE_CUSTOM_CITIES,
      JSON.stringify(state.customCities)
    ).catch(() => {});
  }, [state.customCities]);

  const fetchWeather = async (city) => {
    dispatch({ type: 'SET_LOADING' });
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}` +
          `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure` +
          `&hourly=temperature_2m,weather_code,precipitation_probability` +
          `&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum,sunrise,sunset,uv_index_max` +
          `&timezone=auto&forecast_days=7`
      );
      if (!response.ok) throw new Error('Failed to fetch weather data');
      const data = await response.json();
      dispatch({
        type: 'SET_WEATHER',
        payload: { cityName: city.name, data },
      });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    }
  };

  const searchCities = async (query) => {
    if (!query || query.trim().length < 2) {
      dispatch({ type: 'SET_SEARCH_RESULTS', payload: [] });
      return;
    }
    dispatch({ type: 'SET_SEARCHING', payload: true });
    try {
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          query.trim()
        )}&count=8&language=en&format=json`
      );
      const data = await response.json();
      const results = (data.results || []).map((r) => ({
        name: r.name,
        latitude: r.latitude,
        longitude: r.longitude,
        country: r.country_code || '',
        admin: r.admin1 || '',
        population: r.population || 0,
      }));
      dispatch({ type: 'SET_SEARCH_RESULTS', payload: results });
    } catch (err) {
      dispatch({ type: 'SET_SEARCH_RESULTS', payload: [] });
    }
  };

  const addCustomCity = (city) => {
    dispatch({ type: 'ADD_CUSTOM_CITY', payload: city });
  };

  const removeCustomCity = (cityName) => {
    dispatch({ type: 'REMOVE_CUSTOM_CITY', payload: cityName });
  };

  const selectCity = (city) => {
    dispatch({ type: 'SELECT_CITY', payload: city });
  };

  const toggleFavorite = (cityName) => {
    dispatch({ type: 'TOGGLE_FAVORITE', payload: cityName });
  };

  const setUnit = (unit) => {
    dispatch({ type: 'SET_UNIT', payload: unit });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const clearSearchResults = () => {
    dispatch({ type: 'SET_SEARCH_RESULTS', payload: [] });
  };

  const isFavorite = (cityName) => state.favorites.includes(cityName);

  const isCustomCity = (cityName) =>
    state.customCities.some((c) => c.name === cityName);

  return (
    <WeatherContext.Provider
      value={{
        ...state,
        fetchWeather,
        searchCities,
        addCustomCity,
        removeCustomCity,
        selectCity,
        toggleFavorite,
        setUnit,
        clearError,
        clearSearchResults,
        isFavorite,
        isCustomCity,
      }}
    >
      {children}
    </WeatherContext.Provider>
  );
}

export function useWeather() {
  const context = useContext(WeatherContext);
  if (!context) {
    throw new Error('useWeather must be used within WeatherProvider');
  }
  return context;
}
