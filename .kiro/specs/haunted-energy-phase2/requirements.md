# Requirements Document - Haunted Energy Dashboard Phase 2

## Introduction

Phase 2 of the Haunted Home Energy Dashboard transforms the prototype into a production-ready multi-user application with authentication, real-time updates, notifications, comprehensive reporting, and an enhanced cyber-goth UI. The system will support multiple users, each with their own homes and devices, with real-time telemetry streaming, intelligent anomaly detection, and actionable notifications.

## Glossary

- **User**: An authenticated person with an account in the system
- **Home**: A physical location owned by a User containing monitored Devices
- **Session**: An authenticated connection between a User and the system
- **JWT**: JSON Web Token used for authentication
- **RLS**: Row Level Security - database policies ensuring Users only access their own data
- **Realtime Channel**: A Supabase subscription that pushes updates to clients
- **Notification**: A system-generated message alerting a User to an event
- **Report**: An aggregated summary of energy usage over a time period
- **Telemetry Simulator**: A background process that generates realistic device power data
- **Haunted Oracle**: The poetic messaging system for anomaly descriptions
- **Service Key**: A privileged Supabase key used only on the server
- **Anon Key**: A public Supabase key used on the client

## Requirements

### Requirement 1: User Authentication

**User Story:** As a homeowner, I want to create an account and log in securely, so that I can access my personal energy data from any device.

#### Acceptance Criteria

1. WHEN a User visits the application THEN the system SHALL redirect unauthenticated Users to the login page
2. WHEN a User submits valid credentials THEN the system SHALL authenticate via Supabase and create a Session
3. WHEN a User signs up THEN the system SHALL create a User account and automatically create a default Home
4. WHEN a User logs out THEN the system SHALL invalidate the Session and redirect to the login page
5. WHEN a Session expires THEN the system SHALL redirect the User to the login page

### Requirement 2: Row Level Security

**User Story:** As a system administrator, I want database access controlled by user ownership, so that users can only access their own data.

#### Acceptance Criteria

1. WHEN a User queries homes THEN the system SHALL return only homes where owner_id matches the authenticated User
2. WHEN a User queries devices THEN the system SHALL return only devices in homes owned by the User
3. WHEN a User queries telemetry THEN the system SHALL return only telemetry for devices in homes owned by the User
4. WHEN a User queries anomalies THEN the system SHALL return only anomalies for devices in homes owned by the User
5. WHEN a User queries notifications THEN the system SHALL return only notifications where user_id matches the authenticated User

### Requirement 3: Home Management

**User Story:** As a homeowner, I want to create and manage multiple homes, so that I can monitor energy usage across different properties.

#### Acceptance Criteria

1. WHEN a User creates a Home THEN the system SHALL store the Home with the User as owner
2. WHEN a User lists homes THEN the system SHALL return all homes owned by the User
3. WHEN a User updates a Home THEN the system SHALL modify the Home if the User is the owner
4. WHEN a User deletes a Home THEN the system SHALL remove the Home and all associated devices if the User is the owner
5. WHEN a User selects a Home THEN the system SHALL display devices and data for that Home only

### Requirement 4: Device CRUD Operations

**User Story:** As a homeowner, I want to add, edit, and remove devices, so that I can keep my device list accurate.

#### Acceptance Criteria

1. WHEN a User creates a Device THEN the system SHALL store the Device associated with a Home owned by the User
2. WHEN a User lists devices THEN the system SHALL return all devices for the selected Home
3. WHEN a User updates a Device THEN the system SHALL modify the Device if it belongs to a Home owned by the User
4. WHEN a User deletes a Device THEN the system SHALL remove the Device if it belongs to a Home owned by the User
5. WHEN a User toggles a Device state THEN the system SHALL update the Device state and trigger telemetry changes

### Requirement 5: Real-time Telemetry Streaming

**User Story:** As a homeowner, I want to see live power consumption updates without refreshing, so that I can monitor energy usage in real-time.

#### Acceptance Criteria

1. WHEN a User views the dashboard THEN the system SHALL subscribe to the telemetry Realtime Channel for the selected Home
2. WHEN new telemetry data is inserted THEN the system SHALL broadcast the update via the Realtime Channel
3. WHEN the client receives a telemetry update THEN the system SHALL update the displayed device power values
4. WHEN the User switches homes THEN the system SHALL unsubscribe from the old channel and subscribe to the new channel
5. WHEN the connection is lost THEN the system SHALL attempt to reconnect automatically

### Requirement 6: Real-time Anomaly Notifications

**User Story:** As a homeowner, I want to be notified immediately when anomalies are detected, so that I can take action quickly.

#### Acceptance Criteria

1. WHEN an anomaly is detected THEN the system SHALL insert a Notification record for the User
2. WHEN a Notification is created THEN the system SHALL broadcast via the notifications Realtime Channel
3. WHEN the client receives a Notification THEN the system SHALL display a toast message with the Haunted Oracle description
4. WHEN a User clicks a Notification THEN the system SHALL navigate to the anomaly details
5. WHEN a User marks a Notification as read THEN the system SHALL update the read status

### Requirement 7: Telemetry Simulator

**User Story:** As a system administrator, I want a background process to generate realistic telemetry, so that the system can demonstrate functionality without physical devices.

#### Acceptance Criteria

1. WHEN the telemetry simulator runs THEN the system SHALL generate power readings for all devices every 1.5 seconds
2. WHEN generating telemetry THEN the system SHALL insert records into the telemetry table
3. WHEN telemetry is inserted THEN the system SHALL trigger anomaly detection
4. WHEN anomalies are detected THEN the system SHALL insert anomaly records and create Notifications
5. WHEN a Device is toggled THEN the system SHALL adjust power generation accordingly

### Requirement 8: Anomaly Detection Engine

**User Story:** As a homeowner, I want the system to automatically detect energy anomalies, so that I can identify problems without manual monitoring.

#### Acceptance Criteria

1. WHEN telemetry is generated THEN the system SHALL analyze for phantom loads and power spikes
2. WHEN a phantom load is detected THEN the system SHALL create an anomaly with Haunted Oracle messaging
3. WHEN a power spike is detected THEN the system SHALL create an anomaly with severity-based messaging
4. WHEN an anomaly is created THEN the system SHALL calculate estimated cost impact
5. WHEN a User resolves an anomaly THEN the system SHALL mark it as resolved with a timestamp

### Requirement 9: Usage Reports

**User Story:** As a homeowner, I want to generate weekly and monthly usage reports, so that I can understand my energy consumption patterns.

#### Acceptance Criteria

1. WHEN a User requests a weekly report THEN the system SHALL aggregate telemetry for the last 7 days
2. WHEN a User requests a monthly report THEN the system SHALL aggregate telemetry for the last 30 days
3. WHEN generating a report THEN the system SHALL calculate total kWh, average daily kWh, and peak usage hours
4. WHEN generating a report THEN the system SHALL identify top energy-consuming devices
5. WHEN generating a report THEN the system SHALL calculate estimated cost based on the kWh rate

### Requirement 10: Notifications Center

**User Story:** As a homeowner, I want to view all my notifications in one place, so that I can review past alerts and anomalies.

#### Acceptance Criteria

1. WHEN a User opens the notifications center THEN the system SHALL display all Notifications for the User
2. WHEN displaying Notifications THEN the system SHALL show unread Notifications first
3. WHEN a User clicks a Notification THEN the system SHALL mark it as read
4. WHEN a User dismisses a Notification THEN the system SHALL remove it from the list
5. WHEN new Notifications arrive THEN the system SHALL update the notification count badge

### Requirement 11: Cyber-Goth UI Theme

**User Story:** As a homeowner, I want a visually stunning neon cyber-goth interface, so that the energy monitoring experience is immersive and engaging.

#### Acceptance Criteria

1. WHEN the dashboard renders THEN the system SHALL apply a dark gradient background (#05060A to #0A0A0F)
2. WHEN displaying interactive elements THEN the system SHALL use neon green (#00FF9C), cyan (#4CC9F0), and pink (#FF44C2) accents
3. WHEN displaying cards THEN the system SHALL apply neon glow effects with box-shadow
4. WHEN a User hovers over interactive elements THEN the system SHALL intensify the glow effect
5. WHEN anomalies are displayed THEN the system SHALL apply glitch animation effects

### Requirement 12: History Page

**User Story:** As a homeowner, I want to view historical energy data with date range selection, so that I can analyze usage patterns over time.

#### Acceptance Criteria

1. WHEN a User opens the history page THEN the system SHALL display a date range selector
2. WHEN a User selects a date range THEN the system SHALL query telemetry for that period
3. WHEN displaying historical data THEN the system SHALL render a line chart showing power over time
4. WHEN a User clicks export THEN the system SHALL generate a CSV file with the telemetry data
5. WHEN the date range is large THEN the system SHALL aggregate data points to maintain performance

### Requirement 13: Device Control Interface

**User Story:** As a homeowner, I want to control my devices from the dashboard, so that I can manage power consumption remotely.

#### Acceptance Criteria

1. WHEN a User views a Device THEN the system SHALL display toggle buttons for on/off/standby states
2. WHEN a User toggles a Device state THEN the system SHALL send a control command to the backend
3. WHEN a control command is received THEN the system SHALL update the Device state in the database
4. WHEN a Device state changes THEN the system SHALL broadcast the update via Realtime
5. WHEN displaying a Device THEN the system SHALL show a power slider for manual power adjustment

### Requirement 14: Simulation Scenarios

**User Story:** As a system administrator, I want to trigger simulation scenarios, so that I can demonstrate anomaly detection and system behavior.

#### Acceptance Criteria

1. WHEN a User triggers a phantom_load scenario THEN the system SHALL set a Device to draw power while off
2. WHEN a User triggers a spike scenario THEN the system SHALL increase a Device power consumption significantly
3. WHEN a User triggers a ghost_walk scenario THEN the system SHALL affect multiple devices simultaneously
4. WHEN a scenario is triggered THEN the system SHALL generate appropriate anomalies
5. WHEN a scenario completes THEN the system SHALL return devices to normal operation

### Requirement 15: Demo Home Setup

**User Story:** As a new user, I want to automatically create a demo home with sample devices, so that I can explore the system immediately.

#### Acceptance Criteria

1. WHEN a User signs up THEN the system SHALL offer to create a demo home
2. WHEN a User accepts demo home creation THEN the system SHALL create a Home named "Haunted Manor"
3. WHEN creating a demo home THEN the system SHALL add 5 sample devices with different types and rooms
4. WHEN demo devices are created THEN the system SHALL start the telemetry simulator for those devices
5. WHEN demo devices are active THEN the system SHALL generate realistic power fluctuations and occasional anomalies

