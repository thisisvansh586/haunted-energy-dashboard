# Requirements Document

## Introduction

The Haunted Home Energy Dashboard is a real-time energy monitoring system that tracks smart home device power consumption and detects energy anomalies. The system provides a spooky-themed web interface for visualizing device locations, monitoring power usage, and alerting users to phantom loads and power spikes that waste energy and increase costs.

## Glossary

- **Dashboard**: The web-based user interface for monitoring energy consumption
- **Device**: A smart home appliance or electronic device being monitored for power consumption
- **Power Consumption**: The amount of electrical power a device is using, measured in watts (W)
- **Phantom Load**: Energy consumed by a device when it is in standby or off state but still drawing power
- **Power Spike**: A sudden increase in power consumption significantly above the device's normal baseline
- **Anomaly**: An unusual energy consumption pattern that may indicate inefficiency or malfunction
- **Idle Threshold**: The maximum power consumption (in watts) below which a device is considered idle
- **Telemetry**: Real-time data about device power consumption and state
- **State**: The operational mode of a device (on, off, or standby)

## Requirements

### Requirement 1

**User Story:** As a homeowner, I want to view all my devices on a visual house map, so that I can quickly see which devices are consuming power in each room.

#### Acceptance Criteria

1. WHEN the Dashboard loads THEN the system SHALL display a house map showing all rooms
2. WHEN a Device is active THEN the system SHALL display the Device icon on the house map in its assigned room location
3. WHEN displaying a Device on the house map THEN the system SHALL color-code the Device icon based on its State (green for on, gray for off, yellow for standby)
4. WHEN a user hovers over a Device icon THEN the system SHALL display the Device name and current Power Consumption
5. WHEN a user clicks a Device icon THEN the system SHALL navigate to the device detail view

### Requirement 2

**User Story:** As a homeowner, I want to see a list of all my devices with their current power consumption, so that I can identify which devices are using the most energy.

#### Acceptance Criteria

1. WHEN the Dashboard displays the device list THEN the system SHALL show each Device name, room location, State, and current Power Consumption
2. WHEN a Device State changes THEN the system SHALL update the displayed State badge within 5 seconds
3. WHEN displaying Power Consumption THEN the system SHALL format the value with one decimal place and the unit "W"
4. WHEN a Device is in on State THEN the system SHALL display a green State badge
5. WHEN a Device is in off State THEN the system SHALL display a gray State badge
6. WHEN a Device is in standby State THEN the system SHALL display a yellow State badge

### Requirement 3

**User Story:** As a homeowner, I want to see my total power consumption and estimated daily cost, so that I can understand my overall energy usage.

#### Acceptance Criteria

1. WHEN the Dashboard displays the usage gauge THEN the system SHALL calculate total Power Consumption by summing all Device power values
2. WHEN displaying total Power Consumption THEN the system SHALL show the value in watts with one decimal place
3. WHEN calculating daily cost THEN the system SHALL use the formula (totalPowerW / 1000) * 24 * 0.12
4. WHEN displaying estimated daily cost THEN the system SHALL format the value as a dollar amount with two decimal places
5. WHEN displaying device count THEN the system SHALL show the total number of monitored Devices

### Requirement 4

**User Story:** As a homeowner, I want the system to detect phantom loads, so that I can identify devices wasting energy in standby mode.

#### Acceptance Criteria

1. WHEN a Device State is standby or off AND Power Consumption exceeds Idle Threshold THEN the system SHALL create a phantom_load Anomaly
2. WHEN Power Consumption is less than Idle Threshold times 2 THEN the system SHALL assign low severity to the Anomaly
3. WHEN Power Consumption is between Idle Threshold times 2 and Idle Threshold times 5 THEN the system SHALL assign medium severity to the Anomaly
4. WHEN Power Consumption exceeds Idle Threshold times 5 THEN the system SHALL assign high severity to the Anomaly
5. WHEN creating an Anomaly THEN the system SHALL record the Device identifier, Anomaly type, severity, timestamp, and power delta

### Requirement 5

**User Story:** As a homeowner, I want the system to detect power spikes, so that I can identify devices consuming excessive energy or potentially malfunctioning.

#### Acceptance Criteria

1. WHEN a Device State is on AND Power Consumption exceeds baseline by 30 percent THEN the system SHALL create a spike Anomaly
2. WHEN Power Consumption is less than 150 percent of baseline THEN the system SHALL assign low severity to the Anomaly
3. WHEN Power Consumption is between 150 percent and 200 percent of baseline THEN the system SHALL assign medium severity to the Anomaly
4. WHEN Power Consumption is between 200 percent and 300 percent of baseline THEN the system SHALL assign high severity to the Anomaly
5. WHEN Power Consumption exceeds 300 percent of baseline THEN the system SHALL assign critical severity to the Anomaly

### Requirement 6

**User Story:** As a homeowner, I want to view all detected anomalies in a panel, so that I can review and address energy issues.

#### Acceptance Criteria

1. WHEN the Dashboard displays the anomaly panel THEN the system SHALL show all detected Anomalies with type, severity, Device name, and timestamp
2. WHEN displaying an Anomaly THEN the system SHALL show a color-coded severity badge (blue for low, yellow for medium, orange for high, red for critical)
3. WHEN displaying an Anomaly THEN the system SHALL include a description of the issue and estimated cost impact
4. WHEN displaying an Anomaly timestamp THEN the system SHALL show relative time (e.g., "5m ago", "2h ago")
5. WHEN no Anomalies exist THEN the system SHALL display a message indicating no anomalies detected

### Requirement 7

**User Story:** As a homeowner, I want to toggle between light and dark themes, so that I can use the dashboard comfortably at different times of day.

#### Acceptance Criteria

1. WHEN the Dashboard loads THEN the system SHALL apply the theme preference stored in browser localStorage
2. WHEN a user clicks the theme toggle button THEN the system SHALL switch between light and dark themes
3. WHEN the theme changes THEN the system SHALL save the new preference to browser localStorage
4. WHEN applying the light theme THEN the system SHALL use warm colors (cornsilk background, saddle brown primary)
5. WHEN applying the dark theme THEN the system SHALL use cool colors (dark purple background, magenta accents)

### Requirement 8

**User Story:** As a homeowner, I want the dashboard to update automatically, so that I always see current power consumption data without manual refresh.

#### Acceptance Criteria

1. WHEN the Dashboard is active THEN the system SHALL fetch updated Telemetry data every 1 to 2 seconds
2. WHEN new Telemetry data is received THEN the system SHALL update all displayed Device power values
3. WHEN new Telemetry data is received THEN the system SHALL update the total Power Consumption and cost estimate
4. WHEN new Telemetry data is received THEN the system SHALL update the Anomaly list
5. WHEN a network error occurs THEN the system SHALL log the error and continue attempting updates

### Requirement 9

**User Story:** As a system administrator, I want the backend to simulate realistic device telemetry, so that the dashboard can be tested and demonstrated without physical devices.

#### Acceptance Criteria

1. WHEN the telemetry simulator runs THEN the system SHALL generate Power Consumption values based on Device baseline with realistic fluctuations
2. WHEN a Device State is on THEN the system SHALL vary Power Consumption within 10 percent of baseline
3. WHEN a Device State is standby THEN the system SHALL generate Power Consumption between 50 percent and 150 percent of Idle Threshold
4. WHEN a Device State is off THEN the system SHALL set Power Consumption to zero
5. WHEN generating telemetry THEN the system SHALL use seeded random numbers for deterministic testing

### Requirement 10

**User Story:** As a homeowner, I want the dashboard to have haunted visual effects, so that the energy monitoring experience is immersive and engaging.

#### Acceptance Criteria

1. WHEN the Dashboard renders THEN the system SHALL display a fog overlay effect with slow drifting animation
2. WHEN displaying the header THEN the system SHALL apply a flicker animation to create an unstable lighting effect
3. WHEN a Device has high Power Consumption THEN the system SHALL apply a neon green glow pulse effect
4. WHEN an Anomaly is detected THEN the system SHALL trigger a glitch animation effect
5. WHEN the Dashboard is active THEN the system SHALL display subtle floating particle effects in the background

### Requirement 11

**User Story:** As a homeowner, I want to see historical usage data visualized in charts, so that I can understand energy consumption patterns over time.

#### Acceptance Criteria

1. WHEN the Dashboard displays the usage chart THEN the system SHALL render a line chart showing total Power Consumption over the last 60 data points
2. WHEN the Dashboard displays the device chart THEN the system SHALL render a bar chart showing current Power Consumption for each Device
3. WHEN new Telemetry data is received THEN the system SHALL update both charts with the latest values
4. WHEN displaying chart axes THEN the system SHALL label the x-axis with time or device names and the y-axis with watts
5. WHEN a chart renders THEN the system SHALL apply theme-appropriate colors matching the haunted aesthetic

### Requirement 12

**User Story:** As a homeowner, I want rooms on the house map to glow based on usage, so that I can quickly identify high-energy areas.

#### Acceptance Criteria

1. WHEN a room contains active Devices THEN the system SHALL calculate total room Power Consumption by summing Device power values
2. WHEN room Power Consumption is below 100 watts THEN the system SHALL apply a dim glow effect
3. WHEN room Power Consumption is between 100 and 300 watts THEN the system SHALL apply a medium glow effect
4. WHEN room Power Consumption exceeds 300 watts THEN the system SHALL apply a bright glow effect with pulsing animation
5. WHEN a user hovers over a room THEN the system SHALL intensify the glow effect
