<div align="center">
🌦️ WeatherApp

**A basic weather application built with React Native & Expo.**

[![Platform](https://img.shields.io/badge/platform-Android-3DDC84?logo=android&logoColor=white)](https://expo.dev/accounts/jethzki/projects/WeatherApp/builds/e3ba7cad-38d4-46d3-9151-92176f0e593f)
[![Framework](https://img.shields.io/badge/React_Native-Expo_SDK_55-0ea5e9?logo=expo)](https://expo.dev)
[![API](https://img.shields.io/badge/Weather-Open--Meteo_API-f97316)](https://open-meteo.com)
[![License](https://img.shields.io/badge/license-MIT-8b5cf6)](LICENSE)

Real-time global weather · City favorites · Custom search · Persistent settings · Clean modern UI

---

<p>
  <img src="screenshots/home.png" width="220" style="border-radius:12px; margin: 8px"/>
  <img src="screenshots/details.png" width="220" style="border-radius:12px; margin: 8px"/>
  <img src="screenshots/settings.png" width="220" style="border-radius:12px; margin: 8px"/>
</p>

---

[📥 Download APK](https://expo.dev/accounts/jethzki/projects/WeatherApp/builds/e3ba7cad-38d4-46d3-9151-92176f0e593f)

</div>

---

## ✨ Features

### 🏠 Home Screen
- 🌍 **12 preloaded global cities** ready out of the box
- 🔍 **Real-time search & filtering** across all cities
- ➕ **Add custom cities** via geocoding modal
- ⭐ **Favorites system** — pinned and highlighted at the top
- ⏳ **Skeleton loading animations** for smooth UX
- 🔄 **Pull-to-refresh** support

### 📊 Details Screen
- 🎨 **Gradient hero card** with current conditions at a glance
- 🕒 **24-hour hourly forecast** with horizontal scrolling
- 📅 **7-day forecast** with temperature range bars
- 🌡️ Feels-like temperature & humidity
- 💨 Wind speed with human-readable level descriptions
- ☀️ UV Index with color-coded severity badge
- 🌅 Sunrise & Sunset times
- 🕓 Relative update timestamps
- ⭐ Favorite toggle

### ⚙️ Settings
- 🌡️ Toggle °C / °F — persisted across sessions
- ⭐ Manage and reorder favorites
- 🗺️ Manage custom cities
- ℹ️ App info & API attribution

  ---

ℹ️ App info & API attribution
🛠️ Tech Stack
<table> <tr> <td align="center"><strong>Framework</strong></td> <td align="center"><strong>Language</strong></td> <td align="center"><strong>Navigation</strong></td> <td align="center"><strong>State</strong></td> </tr> <tr> <td align="center"> <img src="https://skillicons.dev/icons?i=react" width="50"/><br/> React Native <br/><br/> <img src="https://skillicons.dev/icons?i=expo" width="50"/><br/> Expo SDK 55 </td> <td align="center"> <img src="https://skillicons.dev/icons?i=javascript" width="50"/><br/> JavaScript (ES6+) </td> <td align="center"> <img src="https://skillicons.dev/icons?i=react" width="50"/><br/> React Navigation v7 </td> <td align="center"> <img src="https://skillicons.dev/icons?i=react" width="50"/><br/> Context API<br/>+ useReducer </td> </tr> <tr> <td align="center"><strong>Storage</strong></td> <td align="center"><strong>API</strong></td> <td align="center"><strong>UI</strong></td> <td align="center"><strong>Build</strong></td> </tr> <tr> <td align="center"> <img src="https://skillicons.dev/icons?i=react" width="50"/><br/> AsyncStorage </td> <td align="center"> <img src="https://skillicons.dev/icons?i=cloud" width="50"/><br/> Open-Meteo API<br/> Geocoding API </td> <td align="center"> <img src="https://skillicons.dev/icons?i=expo" width="50"/><br/> expo-linear-gradient </td> <td align="center"> <img src="https://skillicons.dev/icons?i=android" width="50"/><br/> Android APK <br/><br/> <img src="https://skillicons.dev/icons?i=expo" width="50"/><br/> EAS Build </td> </tr> </table>

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- Android device or emulator

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/WeatherApp.git
cd WeatherApp

# Install dependencies
npm install

# Start the development server
npx expo start
```

Scan the QR code with the **Expo Go** app on your device, or press `a` to open on an Android emulator.

### Build APK

```bash
# Install EAS CLI
npm install -g eas-cli

# Log in and build
eas login
eas build --platform android --profile preview
```

Or [download the latest APK](https://expo.dev/accounts/jethzki/projects/WeatherApp/builds/e3ba7cad-38d4-46d3-9151-92176f0e593f) directly.




---

## 🌐 API

This app uses the free, open-source **[Open-Meteo API](https://open-meteo.com/)** — no API key required.

- **Weather data**: `https://api.open-meteo.com/v1/forecast`
- **Geocoding**: `https://geocoding-api.open-meteo.com/v1/search`


---
