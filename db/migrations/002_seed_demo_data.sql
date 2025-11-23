-- Seed Demo Data for Haunted Home Energy Dashboard
-- Run this AFTER signing up to create demo home and devices
-- Replace 'YOUR_USER_ID' with your actual auth.users.id

-- Note: This is a template. The actual seeding will be done via API
-- when a user first signs up (see server/routes/auth.js)

-- Example structure (DO NOT RUN AS-IS):
/*
-- Insert demo home
INSERT INTO homes (owner, name) VALUES
  ('YOUR_USER_ID', 'Haunted Manor');

-- Get the home_id
WITH new_home AS (
  SELECT id FROM homes WHERE owner = 'YOUR_USER_ID' LIMIT 1
)
-- Insert demo devices
INSERT INTO devices (home_id, name, type, icon, room, state, idle_threshold, base_power)
SELECT 
  new_home.id,
  name,
  type,
  icon,
  room,
  state,
  idle_threshold,
  base_power
FROM new_home, (VALUES
  ('Haunted Fridge', 'appliance', '🧊', 'Kitchen', 'on', 10.0, 145.2),
  ('Phantom TV', 'entertainment', '📺', 'Living Room', 'standby', 5.0, 2.5),
  ('Cursed AC', 'hvac', '❄️', 'Bedroom', 'on', 15.0, 1850.0),
  ('Possessed Washer', 'appliance', '🌀', 'Laundry Room', 'off', 8.0, 0.0),
  ('Eerie Lamp', 'lighting', '💡', 'Study', 'on', 2.0, 12.0)
) AS devices(name, type, icon, room, state, idle_threshold, base_power);
*/

-- The actual seeding happens automatically via:
-- POST /api/auth/setup-demo-home (called after first login)
