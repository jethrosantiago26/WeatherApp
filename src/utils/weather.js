// Shared weather code mappings used across screens

export const WEATHER_DESCRIPTIONS = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Foggy',
  48: 'Rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  56: 'Freezing drizzle',
  57: 'Heavy freezing drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  66: 'Freezing rain',
  67: 'Heavy freezing rain',
  71: 'Slight snow',
  73: 'Moderate snow',
  75: 'Heavy snow',
  77: 'Snow grains',
  80: 'Slight showers',
  81: 'Moderate showers',
  82: 'Violent showers',
  85: 'Slight snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm w/ hail',
  99: 'Thunderstorm w/ heavy hail',
};

export const WEATHER_ICONS = {
  0: '☀️',
  1: '🌤️',
  2: '⛅',
  3: '☁️',
  45: '🌫️',
  48: '🌫️',
  51: '🌦️',
  53: '🌧️',
  55: '🌧️',
  56: '🌧️',
  57: '🌧️',
  61: '🌧️',
  63: '🌧️',
  65: '🌧️',
  66: '🌧️',
  67: '🌧️',
  71: '🌨️',
  73: '🌨️',
  75: '❄️',
  77: '❄️',
  80: '🌦️',
  81: '🌧️',
  82: '⛈️',
  85: '🌨️',
  86: '🌨️',
  95: '⛈️',
  96: '⛈️',
  99: '⛈️',
};

export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return `${DAY_NAMES[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}`;
}

export function windDirectionLabel(deg) {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8];
}

export function getWeatherIcon(code) {
  return WEATHER_ICONS[code] || '🌡️';
}

export function getWeatherDescription(code) {
  return WEATHER_DESCRIPTIONS[code] || 'Unknown';
}

// Temperature conversion
export function toFahrenheit(celsius) {
  return (celsius * 9) / 5 + 32;
}

export function formatTemp(celsius, unit = 'celsius') {
  if (unit === 'fahrenheit') {
    return `${Math.round(toFahrenheit(celsius))}°F`;
  }
  return `${Math.round(celsius)}°C`;
}

export function formatTempShort(celsius, unit = 'celsius') {
  if (unit === 'fahrenheit') {
    return `${Math.round(toFahrenheit(celsius))}°`;
  }
  return `${Math.round(celsius)}°`;
}

// UV Index level
export function getUVLevel(uv) {
  if (uv == null) return { label: '—', color: '#999' };
  if (uv <= 2) return { label: 'Low', color: '#27AE60' };
  if (uv <= 5) return { label: 'Moderate', color: '#F5A623' };
  if (uv <= 7) return { label: 'High', color: '#E67E22' };
  if (uv <= 10) return { label: 'Very High', color: '#D94A4A' };
  return { label: 'Extreme', color: '#8E44AD' };
}

// Wind speed description
export function getWindLevel(kmh) {
  if (kmh < 2) return 'Calm';
  if (kmh < 12) return 'Light';
  if (kmh < 30) return 'Moderate';
  if (kmh < 50) return 'Strong';
  if (kmh < 75) return 'Very Strong';
  return 'Storm';
}

// Relative time
export function timeAgo(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  const now = new Date();
  const diffMin = Math.round((now - d) / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHrs = Math.round(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  return `${Math.round(diffHrs / 24)}d ago`;
}

// Color palette
export const COLORS = {
  primary: '#4A90D9',
  primaryDark: '#2E6DB4',
  primaryLight: '#6BABEB',
  background: '#E6F4FE',
  card: '#FFFFFF',
  textPrimary: '#1A3A5C',
  textSecondary: '#6B8DAF',
  textMuted: '#99B5CC',
  accent: '#F5A623',
  danger: '#D94A4A',
  success: '#27AE60',
  warning: '#FFF3CD',
  warningText: '#856404',
  border: '#E0E8F0',
  skeleton: '#E8EFF5',
  skeletonShine: '#F4F8FC',
  heroGradientTop: '#5B9FE3',
  heroGradientBottom: '#2E6DB4',
  settingsBg: '#F0F6FC',
};
