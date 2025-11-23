# Database Setup

## Quick Start

1. **Go to Supabase SQL Editor:**
   https://supabase.com/dashboard/project/juzleommevvicyqdebfi/sql/new

2. **Run the schema migration:**
   - Copy the contents of `migrations/001_schema.sql`
   - Paste into SQL Editor
   - Click "Run"

3. **Verify tables created:**
   - Go to Table Editor
   - You should see: homes, devices, telemetry, anomalies, notifications

## Schema Overview

### Tables

**homes** - User homes (multi-home support)
- `id` - UUID primary key
- `owner` - References auth.users(id)
- `name` - Home name
- RLS: Users can only access their own homes

**devices** - Smart devices in homes
- `id` - UUID primary key
- `home_id` - References homes(id)
- `name`, `type`, `icon`, `room` - Device info
- `current_power`, `state`, `idle_threshold` - Power metrics
- RLS: Users can only access devices in their homes

**telemetry** - Time-series power data
- `id` - Bigserial primary key
- `home_id`, `device_id` - References
- `power_w`, `total_w` - Power readings
- `anomaly` - Boolean flag
- RLS: Users can only access telemetry from their homes

**anomalies** - Detected energy issues
- `id` - UUID primary key
- `home_id`, `device_id` - References
- `type`, `severity`, `title`, `message` - Anomaly details
- `resolved` - Boolean flag
- RLS: Users can only access anomalies from their homes

**notifications** - User notifications
- `id` - UUID primary key
- `user_id` - References auth.users(id)
- `title`, `body`, `level` - Notification content
- `read` - Boolean flag
- RLS: Users can only access their own notifications

## Row Level Security (RLS)

All tables have RLS enabled with policies that ensure:
- Users can only SELECT/INSERT/UPDATE/DELETE their own data
- Data isolation between users
- Secure multi-tenant architecture

### Policy Examples

**Homes:** User must be the owner
```sql
auth.uid() = owner
```

**Devices:** User must own the home
```sql
EXISTS (
  SELECT 1 FROM homes
  WHERE homes.id = devices.home_id
  AND homes.owner = auth.uid()
)
```

## Indexes

Optimized indexes for common queries:
- `idx_telemetry_home_created` - Fast telemetry queries by home
- `idx_telemetry_device_created` - Fast telemetry queries by device
- `idx_anomalies_home_created` - Fast anomaly queries
- `idx_notifications_user_created` - Fast notification queries

## Triggers

**update_updated_at_column** - Automatically updates `updated_at` timestamp on:
- homes
- devices

## Demo Data

After signing up, call `POST /api/auth/setup-demo-home` to create:
- 1 demo home ("Haunted Manor")
- 5 demo devices (Fridge, TV, AC, Washer, Lamp)

## Backup & Restore

### Backup
```bash
# From Supabase dashboard
Project Settings > Database > Backups
```

### Restore
```bash
# Use Supabase CLI or dashboard
```

## Troubleshooting

### "permission denied for table X"
- Check RLS policies are created
- Verify you're authenticated
- Check auth.uid() matches table owner

### "relation does not exist"
- Run migrations in order (001, then 002)
- Check table names are lowercase

### Slow queries
- Check indexes are created
- Use EXPLAIN ANALYZE for query plans
- Consider adding more indexes for your use case
