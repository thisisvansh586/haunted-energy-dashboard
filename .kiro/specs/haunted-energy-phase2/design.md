# Design Document - Haunted Energy Dashboard Phase 2

## Overview

Phase 2 transforms the Haunted Energy Dashboard from a single-user prototype into a production-ready multi-user application. The system will support authentication via Supabase Auth, real-time data streaming via Supabase Realtime, comprehensive device management, intelligent anomaly detection with notifications, usage reporting, and an enhanced cyber-goth UI.

The architecture follows a client-server model with:
- **Frontend**: React SPA with Zustand state management, React Router for navigation, and Supabase Realtime subscriptions
- **Backend**: Node.js/Express API with JWT authentication, Supabase service client for database operations, and background telemetry simulator
- **Database**: PostgreSQL via Supabase with Row Level Security (RLS) policies

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (React)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Auth Pages   │  │  Dashboard   │  │   History    │      │
│  │ Login/Signup │  │  Devices     │  │   Reports    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Zustand Store (Auth, UI State)               │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │    Supabase Client (Anon Key, Realtime Channels)     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS + WebSocket
                              │
┌─────────────────────────────────────────────────────────────┐
│                      Backend (Node.js/Express)               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Auth Routes  │  │ Home Routes  │  │Device Routes │      │
│  │ JWT Verify   │  │ CRUD Ops     │  │ CRUD + Ctrl  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │Telemetry Sim │  │Anomaly Detect│  │  Reports     │      │
│  │Background Job│  │Haunted Oracle│  │Aggregations  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │   Supabase Client (Service Key, Full DB Access)      │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ PostgreSQL Protocol
                              │
┌─────────────────────────────────────────────────────────────┐
│                    Supabase (PostgreSQL + Auth)              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Auth       │  │  Database    │  │  Realtime    │      │
│  │   JWT        │  │  RLS Policies│  │  Channels    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  Tables: homes, devices, telemetry, anomalies, notifications │
└─────────────────────────────────────────────────────────────┘
```

### Authentication Flow

1. User submits credentials to Supabase Auth (via frontend)
2. Supabase returns JWT token and user object
3. Frontend stores token in Zustand store (persisted to localStorage)
4. All API requests include `Authorization: Bearer <token>` header
5. Backend middleware verifies JWT with Supabase
6. Backend extracts user ID from JWT for RLS queries

### Real-time Data Flow

1. Frontend subscribes to Supabase Realtime channels (telemetry, anomalies, notifications)
2. Backend telemetry simulator inserts data every 1.5 seconds
3. Supabase broadcasts inserts to subscribed clients
4. Frontend receives updates and updates UI state
5. No polling required - pure push-based updates

## Components and Interfaces

### Frontend Components

#### Authentication Components

**AuthPage.jsx**
- Renders login/signup forms
- Manages form state and validation
- Calls Zustand auth actions
- Redirects to dashboard on success

**ProtectedRoute.jsx**
- Wraps routes requiring authentication
- Checks auth state from Zustand
- Redirects to login if not authenticated
- Shows loading state during auth check

#### Dashboard Components

**DashboardPage.jsx**
- Main container for authenticated users
- Subscribes to realtime channels
- Manages home selection
- Renders HouseMap, DeviceList, UsageGauge, AnomalyPanel

**DeviceManagementModal.jsx**
- Create/edit device form
- Validates device properties
- Calls device API endpoints

**DeviceControlPanel.jsx**
- Toggle buttons for device states
- Power slider for manual adjustment
- Calls control API endpoints

#### History & Reports Components

**HistoryPage.jsx**
- Date range selector
- Line chart for historical telemetry
- CSV export functionality

**ReportsPage.jsx**
- Weekly/monthly report tabs
- Summary cards (total kWh, cost, peak hours)
- Bar chart for top devices

#### Notifications Components

**NotificationBell.jsx**
- Icon with unread count badge
- Dropdown list of recent notifications
- Click to mark as read

**NotificationToast.jsx**
- Animated toast for new notifications
- Displays Haunted Oracle message
- Auto-dismiss after 5 seconds

**NotificationsCenter.jsx**
- Full page list of all notifications
- Filter by read/unread
- Dismiss functionality

### Backend Modules

#### Authentication Middleware

**auth.js**
```javascript
async function authenticateUser(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'No token' })
  
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return res.status(401).json({ error: 'Invalid token' })
  
  req.user = user
  next()
}
```

#### Telemetry Simulator

**telemetrySimulator.js**
```javascript
class TelemetrySimulator {
  constructor(supabase) {
    this.supabase = supabase
    this.interval = null
  }
  
  start() {
    this.interval = setInterval(() => this.generateTelemetry(), 1500)
  }
  
  async generateTelemetry() {
    // Fetch all devices
    // Generate power readings based on state
    // Insert telemetry records
    // Trigger anomaly detection
  }
}
```

#### Anomaly Detector

**anomalyDetector.js**
```javascript
class AnomalyDetector {
  async detectAnomalies(telemetryRecords) {
    const anomalies = []
    
    for (const record of telemetryRecords) {
      // Check phantom load
      if (this.isPhantomLoad(record)) {
        anomalies.push(this.createPhantomLoadAnomaly(record))
      }
      
      // Check power spike
      if (this.isPowerSpike(record)) {
        anomalies.push(this.createPowerSpikeAnomaly(record))
      }
    }
    
    // Insert anomalies
    // Create notifications
    return anomalies
  }
  
  getHauntedOracleMessage(type, severity) {
    // Return poetic message from haunted-oracle.md
  }
}
```

### API Endpoints

#### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Authenticate (handled by Supabase client)
- `POST /api/auth/logout` - Invalidate session
- `POST /api/auth/setup-demo-home` - Create demo home with devices
- `GET /api/auth/profile` - Get user profile

#### Homes
- `GET /api/homes` - List user's homes
- `POST /api/homes` - Create home
- `PUT /api/homes/:id` - Update home
- `DELETE /api/homes/:id` - Delete home (cascade to devices)

#### Devices
- `GET /api/devices?homeId=xxx` - List devices for home
- `POST /api/devices` - Create device
- `PUT /api/devices/:id` - Update device
- `DELETE /api/devices/:id` - Delete device
- `POST /api/devices/:id/toggle` - Toggle state (on/off/standby)
- `POST /api/devices/:id/control` - Set power manually

#### Telemetry
- `GET /api/telemetry?homeId=xxx&since=xxx` - Query historical telemetry
- `GET /api/telemetry/latest?homeId=xxx` - Get latest readings

#### Anomalies
- `GET /api/anomalies?homeId=xxx` - List anomalies for home
- `POST /api/anomalies/:id/resolve` - Mark anomaly as resolved
- `DELETE /api/anomalies/:id` - Delete anomaly

#### Notifications
- `GET /api/notifications` - List user's notifications
- `POST /api/notifications/:id/read` - Mark as read
- `DELETE /api/notifications/:id` - Dismiss notification

#### Reports
- `GET /api/reports?homeId=xxx&period=weekly|monthly` - Generate usage report

#### Simulation
- `POST /api/simulate` - Trigger simulation scenario (phantom_load, spike, ghost_walk)

## Data Models

### Database Schema

**homes**
```sql
CREATE TABLE homes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**devices**
```sql
CREATE TABLE devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  home_id UUID NOT NULL REFERENCES homes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'appliance', 'hvac', 'lighting', 'electronics'
  icon TEXT NOT NULL, -- emoji
  room TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'off', -- 'on', 'off', 'standby'
  base_power REAL NOT NULL, -- watts when on
  idle_threshold REAL NOT NULL, -- watts threshold for phantom load
  current_power REAL DEFAULT 0,
  last_active TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**telemetry**
```sql
CREATE TABLE telemetry (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  power_w REAL NOT NULL,
  state TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_telemetry_device_timestamp ON telemetry(device_id, timestamp DESC);
```

**anomalies**
```sql
CREATE TABLE anomalies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'phantom_load', 'spike', 'ghost_walk'
  severity TEXT NOT NULL, -- 'low', 'medium', 'high', 'critical'
  title TEXT NOT NULL, -- Haunted Oracle title
  description TEXT NOT NULL, -- Haunted Oracle description
  remediation TEXT NOT NULL, -- Actionable fix
  power_delta REAL NOT NULL, -- watts above normal
  estimated_cost REAL NOT NULL, -- dollars per day
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**notifications**
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  anomaly_id UUID REFERENCES anomalies(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'anomaly', 'system'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_read ON notifications(user_id, read, created_at DESC);
```

### Row Level Security Policies

**homes**
```sql
-- Users can only see their own homes
CREATE POLICY homes_select ON homes FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY homes_insert ON homes FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY homes_update ON homes FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY homes_delete ON homes FOR DELETE USING (owner_id = auth.uid());
```

**devices**
```sql
-- Users can only see devices in their homes
CREATE POLICY devices_select ON devices FOR SELECT 
  USING (home_id IN (SELECT id FROM homes WHERE owner_id = auth.uid()));
  
CREATE POLICY devices_insert ON devices FOR INSERT 
  WITH CHECK (home_id IN (SELECT id FROM homes WHERE owner_id = auth.uid()));
  
CREATE POLICY devices_update ON devices FOR UPDATE 
  USING (home_id IN (SELECT id FROM homes WHERE owner_id = auth.uid()));
  
CREATE POLICY devices_delete ON devices FOR DELETE 
  USING (home_id IN (SELECT id FROM homes WHERE owner_id = auth.uid()));
```

**telemetry**
```sql
-- Users can only see telemetry for their devices
CREATE POLICY telemetry_select ON telemetry FOR SELECT 
  USING (device_id IN (
    SELECT d.id FROM devices d 
    JOIN homes h ON d.home_id = h.id 
    WHERE h.owner_id = auth.uid()
  ));
```

**anomalies**
```sql
-- Users can only see anomalies for their devices
CREATE POLICY anomalies_select ON anomalies FOR SELECT 
  USING (device_id IN (
    SELECT d.id FROM devices d 
    JOIN homes h ON d.home_id = h.id 
    WHERE h.owner_id = auth.uid()
  ));
```

**notifications**
```sql
-- Users can only see their own notifications
CREATE POLICY notifications_select ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY notifications_update ON notifications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY notifications_delete ON notifications FOR DELETE USING (user_id = auth.uid());
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Authentication & Authorization Properties

**Property 1: Unauthenticated redirect**
*For any* protected route access without authentication, the system should redirect to the login page
**Validates: Requirements 1.1**

**Property 2: Signup creates home**
*For any* new user signup, the system should create both a user account and a default home
**Validates: Requirements 1.3**

**Property 3: Home ownership isolation**
*For any* user query for homes, the returned homes should only include homes where owner_id matches the authenticated user
**Validates: Requirements 2.1**

**Property 4: Device ownership isolation**
*For any* user query for devices, the returned devices should only belong to homes owned by the authenticated user
**Validates: Requirements 2.2**

**Property 5: Telemetry ownership isolation**
*For any* user query for telemetry, the returned records should only belong to devices in homes owned by the authenticated user
**Validates: Requirements 2.3**

**Property 6: Anomaly ownership isolation**
*For any* user query for anomalies, the returned anomalies should only belong to devices in homes owned by the authenticated user
**Validates: Requirements 2.4**

**Property 7: Notification ownership isolation**
*For any* user query for notifications, the returned notifications should only have user_id matching the authenticated user
**Validates: Requirements 2.5**

### CRUD Operation Properties

**Property 8: Home creation ownership**
*For any* home creation operation, the created home should have owner_id set to the authenticated user
**Validates: Requirements 3.1**

**Property 9: Home update authorization**
*For any* home update operation, the update should only succeed if the authenticated user is the owner
**Validates: Requirements 3.3**

**Property 10: Home deletion cascade**
*For any* home deletion, all associated devices should also be deleted
**Validates: Requirements 3.4**

**Property 11: Device creation authorization**
*For any* device creation operation, the device should only be created if the home_id belongs to a home owned by the authenticated user
**Validates: Requirements 4.1**

**Property 12: Device filtering by home**
*For any* device list query with homeId, the returned devices should all have home_id matching the query parameter
**Validates: Requirements 4.2**

**Property 13: Device update authorization**
*For any* device update operation, the update should only succeed if the device belongs to a home owned by the authenticated user
**Validates: Requirements 4.3**

**Property 14: Device deletion authorization**
*For any* device deletion operation, the deletion should only succeed if the device belongs to a home owned by the authenticated user
**Validates: Requirements 4.4**

**Property 15: Device toggle propagation**
*For any* device state toggle, the device state should be updated and subsequent telemetry should reflect the new state
**Validates: Requirements 4.5**

### Real-time & Notification Properties

**Property 16: Telemetry UI update**
*For any* telemetry update received via realtime, the displayed device power values should be updated to match the new data
**Validates: Requirements 5.3**

**Property 17: Anomaly creates notification**
*For any* detected anomaly, a notification record should be created for the device owner
**Validates: Requirements 6.1**

**Property 18: Notification triggers toast**
*For any* notification received via realtime, a toast message should be displayed with the Haunted Oracle description
**Validates: Requirements 6.3**

**Property 19: Notification read status**
*For any* notification marked as read, the read field should be updated to true
**Validates: Requirements 6.5**

### Telemetry Simulator Properties

**Property 20: Simulator generates telemetry**
*For any* simulator run, telemetry records should be inserted for all active devices
**Validates: Requirements 7.2**

**Property 21: Telemetry triggers detection**
*For any* telemetry insertion, the anomaly detection engine should be invoked
**Validates: Requirements 7.3**

**Property 22: Anomaly creates notification**
*For any* detected anomaly, both an anomaly record and a notification should be created
**Validates: Requirements 7.4**

**Property 23: Device toggle affects power**
*For any* device state toggle, the generated telemetry power should reflect the new state
**Validates: Requirements 7.5**

**Property 24: Anomaly resolution timestamp**
*For any* anomaly marked as resolved, the resolved_at field should be set to the current timestamp
**Validates: Requirements 8.5**

### Report Properties

**Property 25: Report completeness**
*For any* generated report, the report should include total_kwh, avg_daily_kwh, peak_hours, top_devices, and estimated_cost
**Validates: Requirements 9.3**

**Property 26: Top devices accuracy**
*For any* generated report, the top_devices list should be sorted by total energy consumption in descending order
**Validates: Requirements 9.4**

**Property 27: Cost calculation**
*For any* generated report, the estimated_cost should equal total_kwh multiplied by the kWh rate
**Validates: Requirements 9.5**

### Notification Center Properties

**Property 28: Notification completeness**
*For any* user opening the notifications center, all notifications for that user should be displayed
**Validates: Requirements 10.1**

**Property 29: Unread notifications first**
*For any* notification list display, unread notifications should appear before read notifications
**Validates: Requirements 10.2**

**Property 30: Notification count accuracy**
*For any* notification count badge, the count should equal the number of unread notifications for the user
**Validates: Requirements 10.5**

### History & Export Properties

**Property 31: Date range filtering**
*For any* telemetry query with a date range, the returned records should all have timestamps within the specified range
**Validates: Requirements 12.2**

**Property 32: Chart data accuracy**
*For any* historical chart, the displayed data points should match the telemetry query results
**Validates: Requirements 12.3**

**Property 33: CSV export completeness**
*For any* CSV export, the file should contain all telemetry records from the query with all fields
**Validates: Requirements 12.4**

**Property 34: Large range aggregation**
*For any* date range exceeding 1000 data points, the system should aggregate data to reduce the point count
**Validates: Requirements 12.5**

### Device Control Properties

**Property 35: Control command persistence**
*For any* device control command, the device state should be updated in the database
**Validates: Requirements 13.3**

### Simulation Properties

**Property 36: Scenario generates anomalies**
*For any* simulation scenario trigger, appropriate anomalies should be generated
**Validates: Requirements 14.4**

**Property 37: Scenario cleanup**
*For any* completed simulation scenario, affected devices should return to their pre-scenario state
**Validates: Requirements 14.5**

**Property 38: Demo home device count**
*For any* demo home creation, exactly 5 devices should be created
**Validates: Requirements 15.3**

**Property 39: Demo home starts simulator**
*For any* demo home creation, the telemetry simulator should begin generating data for the demo devices
**Validates: Requirements 15.4**

## Error Handling

### Authentication Errors
- **401 Unauthorized**: Missing or invalid JWT token → Redirect to login
- **403 Forbidden**: User attempting to access resources they don't own → Return error message
- **Token Expiration**: Supabase handles refresh tokens automatically

### Database Errors
- **Connection Failures**: Retry with exponential backoff, show user-friendly error
- **RLS Policy Violations**: Return 403 with message indicating insufficient permissions
- **Constraint Violations**: Return 400 with validation error details

### Real-time Errors
- **Connection Loss**: Supabase client auto-reconnects, show "Reconnecting..." indicator
- **Subscription Failures**: Log error, attempt resubscription after delay
- **Message Parsing Errors**: Log error, skip malformed message

### API Errors
- **404 Not Found**: Resource doesn't exist or user doesn't have access
- **400 Bad Request**: Invalid input data, return validation errors
- **500 Internal Server Error**: Unexpected server error, log details, return generic message

### Simulator Errors
- **Device Not Found**: Skip device, log warning
- **Database Insert Failure**: Log error, continue with next device
- **Anomaly Detection Failure**: Log error, continue simulator

## Testing Strategy

### Unit Testing

**Frontend Unit Tests:**
- Component rendering with different props
- Form validation logic
- State management actions (Zustand)
- Utility functions (date formatting, cost calculations)
- Mock API calls with test data

**Backend Unit Tests:**
- Route handlers with mocked database
- Authentication middleware with test tokens
- Anomaly detection logic with sample telemetry
- Report aggregation calculations
- Haunted Oracle message selection

### Property-Based Testing

**Property Testing Framework:** fast-check (JavaScript)

**Test Configuration:** Minimum 100 iterations per property test

**Property Test Tagging:** Each test must include a comment:
```javascript
// Feature: haunted-energy-phase2, Property 1: Unauthenticated redirect
```

**Key Properties to Test:**
- Data isolation properties (Properties 3-7)
- Authorization properties (Properties 9, 11, 13, 14)
- Cascade deletion (Property 10)
- Report calculations (Properties 25-27)
- Date range filtering (Property 31)
- Notification ordering (Property 29)

### Integration Testing

**API Integration Tests:**
- Full authentication flow (signup → login → access protected route)
- CRUD operations with database
- RLS policy enforcement
- Realtime subscription and broadcast
- Report generation with real data

**End-to-End Tests:**
- User signup → demo home creation → view dashboard
- Device toggle → telemetry update → UI refresh
- Anomaly detection → notification creation → toast display
- Date range selection → query → chart render → CSV export

### Manual Testing

**UI/UX Testing:**
- Theme consistency across all pages
- Responsive design on mobile/tablet/desktop
- Animation smoothness (60fps target)
- Accessibility (keyboard navigation, screen readers)

**Security Testing:**
- Attempt to access other users' data
- Test with expired tokens
- SQL injection attempts (should be blocked by parameterized queries)
- XSS attempts (should be sanitized by React)

## Performance Considerations

### Database Optimization
- Indexes on frequently queried columns (device_id, timestamp, user_id)
- Telemetry table partitioning by timestamp (monthly partitions)
- Aggregate old telemetry data (>90 days) to hourly averages
- Connection pooling for database connections

### Real-time Optimization
- Limit realtime subscriptions to current home only
- Unsubscribe when navigating away from dashboard
- Batch telemetry inserts (insert 10 devices at once)
- Debounce UI updates (max 1 update per 100ms)

### Frontend Optimization
- Code splitting by route (lazy load pages)
- Memoize expensive calculations (React.useMemo)
- Virtualize long lists (react-window for 100+ devices)
- Optimize chart rendering (canvas instead of SVG for large datasets)

### Backend Optimization
- Cache user permissions (5-minute TTL)
- Rate limiting on API endpoints (100 req/min per user)
- Compress API responses (gzip)
- Background job queue for heavy operations (report generation)

## Deployment Considerations

### Environment Variables
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_KEY`: Server-side key (never expose to client)
- `SUPABASE_ANON_KEY`: Client-side key (safe to expose)
- `JWT_SECRET`: For additional token signing (optional)
- `DEFAULT_KWH_RATE`: Cost per kWh (default 0.12)
- `NODE_ENV`: production/development
- `PORT`: Server port (default 3001)

### Database Migrations
- Version control all schema changes
- Use Supabase migration system
- Test migrations on staging before production
- Backup database before major migrations

### Monitoring
- Log all authentication attempts
- Track API response times
- Monitor database query performance
- Alert on anomaly detection failures
- Track realtime connection count

### Scaling
- Horizontal scaling: Multiple backend instances behind load balancer
- Database: Supabase handles scaling automatically
- Realtime: Supabase handles WebSocket scaling
- Telemetry simulator: Run as separate service, one instance per region

