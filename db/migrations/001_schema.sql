-- Haunted Home Energy Dashboard - Database Schema
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/juzleommevvicyqdebfi/sql/new

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLES
-- ============================================================================

-- 1. Homes table - each user can have multiple homes
CREATE TABLE IF NOT EXISTS homes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Devices table - smart devices in each home
CREATE TABLE IF NOT EXISTS devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  home_id UUID REFERENCES homes(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  icon TEXT,
  room TEXT NOT NULL,
  current_power FLOAT DEFAULT 0,
  state TEXT DEFAULT 'off' CHECK (state IN ('on', 'off', 'standby')),
  idle_threshold FLOAT DEFAULT 2,
  base_power FLOAT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Telemetry table - power consumption readings
CREATE TABLE IF NOT EXISTS telemetry (
  id BIGSERIAL PRIMARY KEY,
  home_id UUID REFERENCES homes(id) ON DELETE CASCADE NOT NULL,
  device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
  power_w FLOAT NOT NULL,
  total_w FLOAT NOT NULL,
  anomaly BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_telemetry_home_created ON telemetry(home_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_telemetry_device_created ON telemetry(device_id, created_at DESC);

-- 4. Anomalies table - detected energy issues
CREATE TABLE IF NOT EXISTS anomalies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  home_id UUID REFERENCES homes(id) ON DELETE CASCADE NOT NULL,
  device_id UUID REFERENCES devices(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('phantom_load', 'spike', 'ghost_walk')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  remediation TEXT,
  estimated_cost TEXT,
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_anomalies_home_created ON anomalies(home_id, created_at DESC);

-- 5. Notifications table - user notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  level TEXT DEFAULT 'info' CHECK (level IN ('info', 'warning', 'error', 'success')),
  data JSONB,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications(user_id, created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE homes ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE anomalies ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES - HOMES
-- ============================================================================

-- Users can view their own homes
CREATE POLICY "Users can view own homes"
  ON homes FOR SELECT
  USING (auth.uid() = owner);

-- Users can insert their own homes
CREATE POLICY "Users can create own homes"
  ON homes FOR INSERT
  WITH CHECK (auth.uid() = owner);

-- Users can update their own homes
CREATE POLICY "Users can update own homes"
  ON homes FOR UPDATE
  USING (auth.uid() = owner)
  WITH CHECK (auth.uid() = owner);

-- Users can delete their own homes
CREATE POLICY "Users can delete own homes"
  ON homes FOR DELETE
  USING (auth.uid() = owner);

-- ============================================================================
-- RLS POLICIES - DEVICES
-- ============================================================================

-- Users can view devices in their homes
CREATE POLICY "Users can view devices in own homes"
  ON devices FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM homes
      WHERE homes.id = devices.home_id
      AND homes.owner = auth.uid()
    )
  );

-- Users can insert devices in their homes
CREATE POLICY "Users can create devices in own homes"
  ON devices FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM homes
      WHERE homes.id = devices.home_id
      AND homes.owner = auth.uid()
    )
  );

-- Users can update devices in their homes
CREATE POLICY "Users can update devices in own homes"
  ON devices FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM homes
      WHERE homes.id = devices.home_id
      AND homes.owner = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM homes
      WHERE homes.id = devices.home_id
      AND homes.owner = auth.uid()
    )
  );

-- Users can delete devices in their homes
CREATE POLICY "Users can delete devices in own homes"
  ON devices FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM homes
      WHERE homes.id = devices.home_id
      AND homes.owner = auth.uid()
    )
  );

-- ============================================================================
-- RLS POLICIES - TELEMETRY
-- ============================================================================

-- Users can view telemetry from their homes
CREATE POLICY "Users can view telemetry from own homes"
  ON telemetry FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM homes
      WHERE homes.id = telemetry.home_id
      AND homes.owner = auth.uid()
    )
  );

-- Users can insert telemetry for their homes
CREATE POLICY "Users can insert telemetry for own homes"
  ON telemetry FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM homes
      WHERE homes.id = telemetry.home_id
      AND homes.owner = auth.uid()
    )
  );

-- ============================================================================
-- RLS POLICIES - ANOMALIES
-- ============================================================================

-- Users can view anomalies from their homes
CREATE POLICY "Users can view anomalies from own homes"
  ON anomalies FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM homes
      WHERE homes.id = anomalies.home_id
      AND homes.owner = auth.uid()
    )
  );

-- Users can insert anomalies for their homes
CREATE POLICY "Users can insert anomalies for own homes"
  ON anomalies FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM homes
      WHERE homes.id = anomalies.home_id
      AND homes.owner = auth.uid()
    )
  );

-- Users can update anomalies in their homes
CREATE POLICY "Users can update anomalies in own homes"
  ON anomalies FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM homes
      WHERE homes.id = anomalies.home_id
      AND homes.owner = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM homes
      WHERE homes.id = anomalies.home_id
      AND homes.owner = auth.uid()
    )
  );

-- ============================================================================
-- RLS POLICIES - NOTIFICATIONS
-- ============================================================================

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own notifications
CREATE POLICY "Users can create own notifications"
  ON notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own notifications
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for homes
CREATE TRIGGER update_homes_updated_at
  BEFORE UPDATE ON homes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for devices
CREATE TRIGGER update_devices_updated_at
  BEFORE UPDATE ON devices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SEED DATA (Optional - for testing)
-- ============================================================================

-- This will be run by users after they sign up
-- See db/migrations/002_seed_demo_data.sql

COMMENT ON TABLE homes IS 'User homes - each user can have multiple monitored locations';
COMMENT ON TABLE devices IS 'Smart devices in homes - appliances, electronics, etc.';
COMMENT ON TABLE telemetry IS 'Time-series power consumption data';
COMMENT ON TABLE anomalies IS 'Detected energy anomalies - phantom loads, spikes, etc.';
COMMENT ON TABLE notifications IS 'User notifications for anomalies and events';
