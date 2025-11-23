# 👻 Haunted Home Energy Dashboard - Phase 2

A production-ready, multi-user energy monitoring platform with real-time telemetry, anomaly detection, and haunted cyber-goth UI. Built with React, Node.js, Express, and Supabase.

## 📁 Project Structure

```
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── Header.jsx
│   │   │   ├── HouseMap.jsx
│   │   │   ├── DeviceList.jsx
│   │   │   ├── UsageGauge.jsx
│   │   │   └── AnomalyPanel.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                # Node.js backend
│   ├── server.js         # Express server with telemetry simulator
│   └── package.json
│
└── specs/
    └── energy.spec.yaml  # Project specification
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn

### Installation & Running

**Terminal 1 - Start Backend:**
```bash
cd server
npm install
npm run dev
```
Server runs on http://localhost:3001

**Terminal 2 - Start Frontend:**
```bash
cd client
npm install
npm run dev
```
Client runs on http://localhost:3000

## 🎯 Features

### Core Functionality
- **Real-time monitoring** - Updates every 1.5 seconds for instant feedback
- **House map view** - SVG visualization with room-level power glows
- **Device list** - Live power consumption with high-usage highlighting
- **Usage gauge** - Total power, cost estimates, and overload warnings
- **Anomaly detection** - Intelligent phantom load and power spike detection
- **Haunted Oracle** - Elegant, poetic anomaly descriptions with actionable remediation
- **Historical charts** - Line chart for usage trends, bar chart for device comparison

### Visual Effects
- **Fog overlay** - Drifting atmospheric fog with radial gradients
- **Floating particles** - Ambient particles floating upward
- **Flicker animations** - Unstable lighting on header and critical alerts
- **Neon glow effects** - Pulsing green glows on high-usage devices
- **Glitch animations** - Triggered when new anomalies appear
- **Room glows** - Dynamic room highlighting based on power consumption
- **Custom scrollbars** - Themed scrollbars matching the haunted aesthetic

### User Experience
- **Dark/Light themes** - Toggle between haunted and normal modes
- **Responsive design** - Works on desktop and mobile
- **Smooth transitions** - All interactions are animated
- **Loading states** - Flickering indicators while collecting data
- **Empty states** - Friendly messages when no data is available

## 🔌 API Endpoints

- `GET /api/devices` - List all devices with current power
- `GET /api/anomalies` - Detected energy anomalies
- `GET /api/telemetry` - Complete telemetry snapshot

## 🎨 Haunted Oracle

The dashboard features an elegant "Haunted Oracle" voice for all anomaly messages:

- **Poetic titles** - Evocative names like "A Quiet Thief" or "The Tempest Awakens"
- **Metaphorical descriptions** - Brief explanations using ghost, ember, and shadow imagery
- **Actionable remediation** - Clear steps to resolve issues (no technical jargon)
- **Severity-based messaging** - Different messages for low, medium, high, and critical anomalies

Example anomaly:
```
🔥 Embers Rising
📍 Cursed AC

A notable surge detected — the device draws more than its usual appetite.

💡 Investigate connected loads and ensure proper ventilation for the device.

💰 $0.15 | 5m ago
```

## 🎨 Theme

Toggle between spooky light and dark themes with the moon/sun button in the header. The dark theme features:
- Deep black-blue background (#0A0A0F)
- Neon green highlights (#00FF9C)
- Ghost blue accents (#4CC9F0)
- Atmospheric fog and particle effects
- Glowing cards and interactive elements

Theme preference is saved to localStorage.

## 📊 Sample Devices

- 🧊 Haunted Fridge (Kitchen)
- 📺 Phantom TV (Living Room)
- ❄️ Cursed AC (Bedroom)
- 🌀 Possessed Washer (Laundry Room)
- 💡 Eerie Lamp (Study)

## 🧪 Testing

The project includes comprehensive test coverage:

**Frontend Tests:**
```bash
cd client
npm test
```
- Component unit tests
- Property-based tests for correctness properties
- Chart rendering tests
- 25+ tests covering all components

**Backend Tests:**
```bash
cd server
npm test
```
- Seeded random number generation tests
- Power simulation boundary tests
- Anomaly detection logic tests
- API endpoint integration tests
- 29+ tests with property-based testing

**Test Framework:** Vitest + fast-check for property-based testing

## 🏗️ Architecture

### Frontend (React + Vite)
- **App.jsx** - Main container with state management and polling
- **Header.jsx** - Title and theme toggle
- **HouseMap.jsx** - SVG house visualization with room glows
- **DeviceList.jsx** - Scrollable device list with power indicators
- **UsageGauge.jsx** - Total power display with overload warnings
- **UsageChart.jsx** - Line chart for historical usage (60 data points)
- **DeviceChart.jsx** - Bar chart for device comparison
- **AnomalyPanel.jsx** - Haunted Oracle anomaly messages

### Backend (Node.js + Express)
- **Telemetry Simulator** - Generates realistic power fluctuations
- **Anomaly Detection** - Identifies phantom loads and power spikes
- **Haunted Oracle** - Poetic message generation system
- **RESTful API** - Three endpoints for devices, anomalies, and telemetry

## 🎃 Development

Built with modern web technologies:
- React 18 with hooks
- Vite for fast HMR
- Express for backend API
- CSS3 animations and keyframes
- SVG for charts and visualizations
- Property-based testing with fast-check

## 📝 License

MIT
