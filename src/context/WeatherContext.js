import React, { createContext, useContext, useReducer } from 'react';

const WeatherContext = createContext();

const CITIES = [
  { name: 'New York', latitude: 40.7128, longitude: -74.006 },
  { name: 'London', latitude: 51.5074, longitude: -0.1278 },
  { name: 'Tokyo', latitude: 35.6762, longitude: 139.6503 },
  { name: 'Sydney', latitude: -33.8688, longitude: 151.2093 },
  { name: 'Paris', latitude: 48.8566, longitude: 2.3522 },
  { name: 'Dubai', latitude: 25.2048, longitude: 55.2708 },
  { name: 'São Paulo', latitude: -23.5505, longitude: -46.6333 },
  { name: 'Mumbai', latitude: 19.076, longitude: 72.8777 },
];

const initialState = {
  cities: CITIES,
  weatherData: {},
  selectedCity: null,
  loading: false,
  error: null,
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
      };
    case 'SET_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'SELECT_CITY':
      return { ...state, selectedCity: action.payload };
    default:
      return state;
  }
}

export function WeatherProvider({ children }) {
  const [state, dispatch] = useReducer(weatherReducer, initialState);

  const fetchWeather = async (city) => {
    dispatch({ type: 'SET_LOADING' });
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum&timezone=auto&forecast_days=5`
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

  const selectCity = (city) => {
    dispatch({ type: 'SELECT_CITY', payload: city });
  };

  return (
    <WeatherContext.Provider value={{ ...state, fetchWeather, selectCity }}>
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
