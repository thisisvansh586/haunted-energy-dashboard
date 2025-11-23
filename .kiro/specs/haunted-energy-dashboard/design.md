# Design Document

## Overview

The Haunted Home Energy Dashboard is a full-stack web application consisting of a React frontend and Node.js backend. The system monitors smart home device power consumption in real-time, detects energy anomalies, and presents data through a spooky-themed user interface. The architecture follows a client-server model with RESTful APIs for data exchange and periodic polling for real-time updates.

## Architecture

### System Components

```
┌─────────────────────────────────────────┐
│         React Frontend (Vite)           │
│  ┌────────────────────────────────────┐ │
│  │  App Component                     │ │
│  │  ├─ Header (Theme Toggle)          │ │
│  │  ├─ HouseMap (SVG Visualization)   │ │
│  │  ├─ DeviceList                     │ │
│  │  ├─ UsageGauge                     │ │
│  │  └─ AnomalyPanel                   │ │
│  └────────────────────────────────────┘ │
│              │                           │
│              │ HTTP/REST (polling)       │
│              ▼                           │
│  ┌────────────────────────────────────┐ │
│  │     API Client (fetch)             │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
                │
                │ /api/devices
                │ /api/anomalies
                │
┌───────────────▼─────────────────────────┐
│      Node.js Backend (Express)          │
│  ┌────────────────────────────────────┐ │
│  │  REST API Endpoints                │ │
│  │  ├─ GET /api/devices               │ │
│  │  ├─ GET /api/anomalies             │ │
│  │  └─ GET /api/telemetry             │ │
│  └────────────────────────────────────┘ │
│              │                           │
│              ▼                           │
│  ┌────────────────────────────────────┐ │
│  │  Telemetry Simulator               │ │
│  │  ├─ Device State Generator         │ │
│  │  ├─ Power Fluctuation Engine       │ │
│  │  └─ Seeded Random (deterministic)  │ │
│  └────────────────────────────────────┘ │
│              │                           │
│              ▼                           │
│  ┌────────────────────────────────────┐ │
│  │  Anomaly Detection Engine          │ │
│  │  ├─ Phantom Load Detector          │ │
│  │  └─ Power Spike Detector           │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### Technology Stack

**Frontend:**
- React 18 - UI component library
- Vite - Build tool and dev server
- CSS3 - Styling with theme support
- SVG - Vector graphics for house map

**Backend:**
- Node.js - JavaScript runtime
- Express - Web framework
- CORS - Cross-origin resource sharing

### Communication Pattern

The frontend uses polling to fetch data every 3 seconds. This approach is simple and sufficient for the dashboard's real-time requirements without the complexity of WebSockets.

## Components and Interfaces

### Frontend Components

#### App Component
Main application container that manages global state and orchestrates child components.

**State:**
- `theme: 'light' | 'dark'` - Current theme preference
- `devices: Device[]` - Array of device objects
- `anomalies: Anomaly[]` - Array of detected anomalies

**Responsibilities:**
- Fetch data from backend every 3 seconds
- Manage theme state and localStorage persistence
- Calculate total power consumption
- Pass data to child components

#### Header Component
Displays application title and theme toggle button.

**Props:**
- `theme: string` - Current theme
- `onToggleTheme: () => void` - Theme toggle callback

**Responsibilities:**
- Render application title with spooky icon
- Provide theme toggle button (moon/sun icon)
- Apply theme-specific styling

#### HouseMap Component
SVG-based visualization showing devices positioned in rooms.

**Props:**
- `devices: Device[]` - Array of devices to display

**Responsibilities:**
- Render room rectangles with labels
- Position device icons based on room mapping
- Color-code devices by state (green/gray/yellow)
- Display device emoji icons and power consumption
- Handle hover interactions (future enhancement)

#### DeviceList Component
Scrollable list of all devices with current status.

**Props:**
- `devices: Device[]` - Array of devices to display

**Responsibilities:**
- Render device cards with name, room, state, and power
- Display color-coded state badges
- Format power consumption with one decimal place
- Provide hover effects for interactivity

#### UsageGauge Component
Summary display of total power consumption and cost.

**Props:**
- `totalPower: number` - Total watts across all devices
- `deviceCount: number` - Number of monitored devices

**Responsibilities:**
- Display total power in large format
- Calculate and show estimated daily cost
- Show device count
- Apply theme-specific accent colors

#### AnomalyPanel Component
List of detected energy anomalies with details.

**Props:**
- `anomalies: Anomaly[]` - Array of anomalies
- `devices: Device[]` - Array of devices for name lookup

**Responsibilities:**
- Render anomaly cards with type, severity, and details
- Display color-coded severity badges
- Show relative timestamps (e.g., "5m ago")
- Display estimated cost impact
- Show empty state when no anomalies exist
- Apply glitch animation when new anomalies appear

#### UsageChart Component
Line chart displaying historical total power consumption.

**Props:**
- `usageHistory: number[]` - Array of historical power values (last 60 points)

**Responsibilities:**
- Render line chart using canvas or SVG
- Display x-axis (time) and y-axis (watts)
- Apply theme-appropriate colors
- Update smoothly when new data arrives
- Show grid lines and labels

#### DeviceChart Component
Bar chart showing current power consumption per device.

**Props:**
- `devices: Device[]` - Array of devices with current power

**Responsibilities:**
- Render bar chart with one bar per device
- Label each bar with device name
- Color bars based on power level or state
- Display power values on or above bars
- Apply theme-appropriate styling

### Backend Modules

#### Express Server
Main server application that handles HTTP requests.

**Endpoints:**
- `GET /api/devices` - Returns array of current device states
- `GET /api/anomalies` - Returns array of detected anomalies
- `GET /api/telemetry` - Returns complete telemetry snapshot

**Responsibilities:**
- Configure CORS for frontend access
- Route requests to appropriate handlers
- Return JSON responses

#### Telemetry Simulator
Generates realistic device power consumption data.

**Class: SeededRandom**
- `constructor(seed: number)` - Initialize with seed
- `next(): number` - Generate next random value (0-1)
- `range(min: number, max: number): number` - Generate value in range

**Function: simulateDevices()**
- Returns: `Device[]`
- Generates current power consumption for each device
- Applies state-based logic (on/standby/off)
- Adds realistic fluctuations using seeded random

**Responsibilities:**
- Maintain base device configuration
- Generate deterministic random fluctuations
- Apply state-specific power consumption rules
- Update lastActive timestamps

#### Anomaly Detection Engine
Analyzes device data to identify energy issues.

**Function: detectAnomalies(devices: Device[])**
- Returns: `Anomaly[]`
- Checks each device for phantom loads and spikes
- Calculates severity based on thresholds
- Generates anomaly objects with details

**Phantom Load Detection:**
- Trigger: state is 'standby' or 'off' AND powerW > idle_threshold
- Severity: Based on ratio to idle_threshold

**Power Spike Detection:**
- Trigger: state is 'on' AND powerW > basePowerW * 1.3
- Severity: Based on ratio to baseline

## Data Models

### Device
Represents a monitored smart home device.

```typescript
interface Device {
  id: string                    // Unique identifier (e.g., "dev_001")
  name: string                  // Human-readable name (e.g., "Haunted Fridge")
  room: string                  // Room location (e.g., "Kitchen")
  powerW: number                // Current power consumption in watts
  state: 'on' | 'off' | 'standby'  // Operational state
  lastActive: string            // ISO 8601 timestamp
  idle_threshold: number        // Idle power threshold in watts
  basePowerW?: number           // Baseline power (backend only)
}
```

### Anomaly
Represents a detected energy consumption issue.

```typescript
interface Anomaly {
  id: string                    // Unique identifier
  deviceId: string              // Reference to device
  type: 'phantom_load' | 'spike'  // Anomaly type
  severity: 'low' | 'medium' | 'high' | 'critical'  // Severity level
  timestamp: string             // ISO 8601 timestamp
  details: {
    powerDelta: number          // Change in watts
    duration: number            // Duration in seconds
    estimatedCost: string       // Cost impact in dollars
    description: string         // Human-readable description
  }
}
```

### Telemetry Response
Complete system snapshot (optional endpoint).

```typescript
interface TelemetryResponse {
  timestamp: string             // Current timestamp
  totalPowerW: number           // Sum of all device power
  activeDevices: number         // Count of non-off devices
  dailyCostEstimate: string     // Estimated daily cost
  anomalyCount: number          // Number of anomalies
  devices: Device[]             // All devices
  anomalies: Anomaly[]          // All anomalies
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Device icon positioning
*For any* device with a room assignment, the device icon should be rendered at the coordinates corresponding to that room on the house map.
**Validates: Requirements 1.2**

### Property 2: State color mapping
*For any* device, the icon color should be green when state is 'on', gray when state is 'off', and yellow when state is 'standby'.
**Validates: Requirements 1.3, 2.4, 2.5, 2.6**

### Property 3: Device list completeness
*For any* device in the system, the device list should display the device's name, room location, state, and current power consumption.
**Validates: Requirements 2.1**

### Property 4: Power consumption formatting
*For any* power consumption value, the displayed string should include the value formatted to one decimal place followed by the unit "W".
**Validates: Requirements 2.3**

### Property 5: Total power calculation
*For any* set of devices, the total power consumption should equal the sum of all individual device power values.
**Validates: Requirements 3.1**

### Property 6: Daily cost calculation
*For any* total power value in watts, the estimated daily cost should equal (totalPowerW / 1000) * 24 * 0.12, formatted to two decimal places.
**Validates: Requirements 3.3, 3.4**

### Property 7: Device count accuracy
*For any* array of devices, the displayed device count should equal the length of the array.
**Validates: Requirements 3.5**

### Property 8: Phantom load detection
*For any* device where state is 'standby' or 'off' and powerW exceeds idle_threshold, the system should create a phantom_load anomaly.
**Validates: Requirements 4.1**

### Property 9: Phantom load severity assignment
*For any* phantom load anomaly, the severity should be 'low' when powerW < idle_threshold * 2, 'medium' when idle_threshold * 2 ≤ powerW < idle_threshold * 5, and 'high' when powerW ≥ idle_threshold * 5.
**Validates: Requirements 4.2, 4.3, 4.4**

### Property 10: Anomaly structure completeness
*For any* created anomaly, the object should contain deviceId, type, severity, timestamp, and details.powerDelta fields.
**Validates: Requirements 4.5**

### Property 11: Power spike detection
*For any* device where state is 'on' and powerW exceeds basePowerW * 1.3, the system should create a spike anomaly.
**Validates: Requirements 5.1**

### Property 12: Spike severity assignment
*For any* spike anomaly, the severity should be 'low' when powerW < baseline * 1.5, 'medium' when baseline * 1.5 ≤ powerW < baseline * 2.0, 'high' when baseline * 2.0 ≤ powerW < baseline * 3.0, and 'critical' when powerW ≥ baseline * 3.0.
**Validates: Requirements 5.2, 5.3, 5.4, 5.5**

### Property 13: Anomaly display completeness
*For any* anomaly displayed in the panel, the rendered output should include the anomaly type, severity, device name, and timestamp.
**Validates: Requirements 6.1**

### Property 14: Severity badge color mapping
*For any* anomaly, the severity badge color should be blue for 'low', yellow for 'medium', orange for 'high', and red for 'critical'.
**Validates: Requirements 6.2**

### Property 15: Anomaly details presence
*For any* displayed anomaly, the rendered output should include a description and estimated cost impact.
**Validates: Requirements 6.3**

### Property 16: Relative timestamp formatting
*For any* timestamp, the displayed relative time should show minutes for times less than 60 minutes ago, hours for times less than 24 hours ago, and days for older times.
**Validates: Requirements 6.4**

### Property 17: Theme toggle behavior
*For any* current theme value ('light' or 'dark'), clicking the theme toggle should change the theme to the opposite value.
**Validates: Requirements 7.2**

### Property 18: Theme persistence
*For any* theme change, the new theme value should be saved to browser localStorage under the key 'theme'.
**Validates: Requirements 7.3**

### Property 19: Telemetry data propagation
*For any* new telemetry data received, all device power values, total power consumption, and anomaly list should be updated to reflect the new data.
**Validates: Requirements 8.2, 8.3, 8.4**

### Property 20: Simulation power fluctuation bounds
*For any* device with state 'on', the generated powerW should be within the range [basePowerW * 0.9, basePowerW * 1.1].
**Validates: Requirements 9.2**

### Property 21: Standby power generation bounds
*For any* device with state 'standby', the generated powerW should be within the range [idle_threshold * 0.5, idle_threshold * 1.5].
**Validates: Requirements 9.3**

### Property 22: Off device power
*For any* device with state 'off', the generated powerW should equal zero.
**Validates: Requirements 9.4**

### Property 23: Seeded random determinism
*For any* seed value, running the seeded random generator with the same seed should produce the same sequence of values.
**Validates: Requirements 9.5**

### Property 24: Room power calculation
*For any* room containing devices, the total room power consumption should equal the sum of all device power values in that room.
**Validates: Requirements 12.1**

### Property 25: Room glow intensity mapping
*For any* room, the glow intensity should be 'dim' when total power < 100W, 'medium' when 100W ≤ power < 300W, and 'bright' when power ≥ 300W.
**Validates: Requirements 12.2, 12.3, 12.4**

### Property 26: Chart data point count
*For any* usage history array, the line chart should display the last 60 data points.
**Validates: Requirements 11.1**

### Property 27: Bar chart device completeness
*For any* set of devices, the bar chart should display one bar for each device showing its current power consumption.
**Validates: Requirements 11.2**

## Visual Effects and Animations

### Haunted Theme Effects

**Color Palette:**
- Background: `#0A0A0F` (deep black-blue)
- Secondary: `#11111A`
- Neon green highlights: `#00FF9C`
- Ghost blue accent: `#4CC9F0`
- Warning orange: `#FF6B35`
- Danger red: `#D7263D`
- Mist white: `rgba(255,255,255,0.08)`

**CSS Animations:**

1. **Fog Overlay** - Slow drifting fog effect using CSS keyframes
   - Semi-transparent gradient overlay
   - Continuous horizontal drift animation
   - 20-30 second animation duration

2. **Flicker Effect** - Applied to header and high-priority elements
   - Random opacity variations
   - 0.1-0.3 second intervals
   - Creates unstable lighting effect

3. **Neon Glow Pulse** - Applied to high-usage devices and gauges
   - Box-shadow with neon green color
   - Pulsing animation (1-2 second cycle)
   - Intensity based on power level

4. **Glitch Animation** - Triggered when anomalies appear
   - Horizontal offset with color channel separation
   - 0.1-0.2 second duration
   - Random trigger timing

5. **Floating Particles** - Background ambient effect
   - Small semi-transparent circles
   - Slow vertical float animation
   - Random horizontal drift

6. **Room Glow** - Applied to house map rooms
   - Inner glow based on room power consumption
   - Hover intensification
   - Pulsing for high-usage rooms

**Implementation Approach:**
- Use CSS `@keyframes` for all animations
- Apply animations via CSS classes
- Use React state to trigger animation classes
- Leverage CSS variables for theme colors
- Use `will-change` property for performance

## Error Handling

### Frontend Error Handling

**Network Errors:**
- API fetch failures should be caught and logged to console
- Polling should continue despite individual fetch failures
- No user-facing error messages for transient network issues
- Stale data remains displayed until successful fetch

**Data Validation:**
- Missing or malformed device data should be filtered out
- Invalid power values (negative, NaN) should default to 0
- Missing room assignments should default to "Unknown"

**State Management:**
- Invalid theme values should default to 'dark'
- localStorage errors should be caught and ignored
- Component render errors should be caught by error boundaries (future enhancement)

### Backend Error Handling

**Simulation Errors:**
- Invalid device configurations should be logged and skipped
- Random number generator failures should fall back to Math.random()
- Negative power values should be clamped to 0

**API Errors:**
- Malformed requests should return 400 Bad Request
- Server errors should return 500 Internal Server Error
- All errors should be logged to console
- CORS errors should be prevented by proper configuration

## Testing Strategy

### Unit Testing

**Frontend Unit Tests:**
- Component rendering with various props
- State management and updates
- Event handlers (theme toggle, clicks)
- Utility functions (formatting, calculations)
- Edge cases (empty arrays, null values)

**Backend Unit Tests:**
- API endpoint responses
- Anomaly detection logic with known inputs
- Seeded random number generation
- Power calculation edge cases

**Testing Framework:** Vitest for both frontend and backend

### Property-Based Testing

Property-based tests will verify universal properties across many randomly generated inputs. Each test should run a minimum of 100 iterations.

**Property Testing Library:** fast-check (JavaScript/TypeScript)

**Key Properties to Test:**
- Power calculation properties (sum, cost formula)
- Anomaly detection thresholds
- State-to-color mappings
- Formatting functions
- Simulation bounds

**Test Tagging Convention:**
Each property-based test must include a comment tag referencing the design document property:
```javascript
// Feature: haunted-energy-dashboard, Property 5: Total power calculation
```

### Integration Testing

- End-to-end API calls from frontend to backend
- Full anomaly detection pipeline
- Theme persistence across page reloads
- Polling mechanism with mock timers

### Manual Testing

- Visual verification of house map layout
- Theme switching appearance
- Responsive design on different screen sizes
- Browser compatibility (Chrome, Firefox, Safari)
