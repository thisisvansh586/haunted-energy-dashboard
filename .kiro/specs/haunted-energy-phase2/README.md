# Haunted Energy Dashboard - Phase 2 Spec

## Overview

This spec defines Phase 2 of the Haunted Energy Dashboard, transforming it from a prototype into a production-ready multi-user application with authentication, real-time updates, notifications, reports, and an enhanced cyber-goth UI.

## Spec Files

- **requirements.md** - 15 requirements with 75 acceptance criteria
- **design.md** - Complete architecture, components, data models, 39 correctness properties, and testing strategy
- **tasks.md** - 32 major tasks with 100+ subtasks for implementation

## Key Features

### Authentication & Security
- User signup/login via Supabase Auth
- JWT-based authentication
- Row Level Security (RLS) for data isolation
- Protected routes and API endpoints

### Multi-User Support
- Multiple homes per user
- Device management (CRUD)
- User-specific data isolation
- Demo home creation for new users

### Real-Time Features
- Live telemetry streaming via Supabase Realtime
- Real-time anomaly notifications
- Toast notifications with Haunted Oracle messages
- WebSocket-based updates (no polling)

### Data & Analytics
- Historical telemetry queries with date ranges
- Weekly/monthly usage reports
- Top device identification
- Cost calculations
- CSV export functionality

### Notifications System
- Notification bell with unread count
- Toast notifications for new anomalies
- Notifications center page
- Mark as read/dismiss functionality

### Device Management
- Full CRUD operations
- Device state control (on/off/standby)
- Manual power adjustment
- Simulation scenarios (phantom_load, spike, ghost_walk)

### Enhanced UI
- Cyber-goth theme with neon colors
- Neon glow effects on cards
- Glitch animations for anomalies
- Fog overlay and floating particles
- Room glow effects based on power consumption

## Technology Stack

### Frontend
- React 18
- Zustand (state management)
- React Router (navigation)
- Supabase Client (auth + realtime)
- Vitest + fast-check (testing)

### Backend
- Node.js + Express
- Supabase Service Client
- JWT authentication middleware
- Background telemetry simulator
- Anomaly detector with Haunted Oracle

### Database
- PostgreSQL via Supabase
- Row Level Security policies
- Realtime channels
- Indexed queries

## Implementation Approach

### Phase 1: Backend (Tasks 1-14)
1. Database schema & RLS policies
2. Authentication middleware
3. API routes (homes, devices, telemetry, anomalies, notifications, reports)
4. Telemetry simulator
5. Anomaly detector
6. Server integration

### Phase 2: Frontend (Tasks 15-27)
1. Auth store & pages
2. React Router setup
3. Realtime subscriptions
4. Device management UI
5. Notifications system
6. History & reports pages
7. Cyber-goth UI theme
8. Demo home setup

### Phase 3: Polish (Tasks 28-32)
1. Documentation
2. Performance optimization
3. Security hardening
4. Comprehensive testing

## Testing Strategy

### Property-Based Testing
- 39 correctness properties
- Minimum 100 iterations per test
- Using fast-check library
- Tagged with property numbers

### Unit Testing
- Component tests
- API endpoint tests
- Middleware tests
- Utility function tests

### Integration Testing
- Full authentication flow
- CRUD operations with RLS
- Realtime subscriptions
- Report generation

## Success Criteria

- [ ] All 32 tasks completed
- [ ] All tests passing (100% pass rate)
- [ ] All 39 correctness properties verified
- [ ] Authentication working end-to-end
- [ ] Real-time updates functioning
- [ ] RLS policies enforcing data isolation
- [ ] Reports generating correctly
- [ ] Notifications system operational
- [ ] Cyber-goth UI fully implemented
- [ ] Documentation complete

## Getting Started

To begin implementation:

1. Review requirements.md to understand all acceptance criteria
2. Study design.md to understand architecture and correctness properties
3. Follow tasks.md sequentially, starting with task 1
4. Run tests after each task to ensure correctness
5. Use checkpoints (tasks 14, 24, 32) to verify progress

## Notes

- All tests are required (no optional tasks)
- Follow the Haunted Oracle style guide in `.kiro/steering/haunted-oracle.md`
- Use existing Phase 1 code as foundation
- Maintain backward compatibility with simulation mode
- Prioritize security and data isolation

