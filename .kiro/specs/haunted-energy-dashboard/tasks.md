# Implementation Plan

- [x] 1. Set up project structure and dependencies





  - Create client and server directories
  - Initialize package.json files with dependencies
  - Configure Vite for React frontend
  - Configure Express server with CORS
  - _Requirements: All_

- [x] 2. Implement backend telemetry simulator




  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 2.1 Create SeededRandom class for deterministic randomness




  - Implement constructor with seed parameter
  - Implement next() method using linear congruential generator
  - Implement range(min, max) helper method
  - _Requirements: 9.5_

- [x] 2.2 Write property test for seeded random determinism






  - **Property 23: Seeded random determinism**
  - **Validates: Requirements 9.5**



- [x] 2.3 Implement simulateDevices function







  - Define base device configuration array
  - Generate power values based on device state
  - Apply ±10% fluctuation for 'on' devices
  - Generate 50-150% of idle_threshold for 'standby' devices
  - Set power to 0 for 'off' devices
  - Update lastActive timestamps
  - _Requirements: 9.1, 9.2, 9.3, 9.4_


- [x] 2.4 Write property tests for power generation bounds





  - **Property 20: Simulation power fluctuation bounds**
  - **Validates: Requirements 9.2**
  - **Property 21: Standby power generation bounds**
  - **Validates: Requirements 9.3**
  - **Property 22: Off device power**
  - **Validates: Requirements 9.4**


- [x] 3. Implement anomaly detection engine




  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 3.1 Create detectAnomalies function

  - Iterate through all devices
  - Check for phantom load conditions
  - Check for power spike conditions
  - Generate anomaly objects with required fields
  - Calculate estimated cost impact
  - _Requirements: 4.1, 4.5, 5.1_

- [x] 3.2 Implement phantom load detection logic

  - Check if state is 'standby' or 'off'
  - Compare powerW to idle_threshold
  - Calculate severity based on ratio
  - Generate descriptive message
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 3.3 Write property tests for phantom load detection



  - **Property 8: Phantom load detection**
  - **Validates: Requirements 4.1**
  - **Property 9: Phantom load severity assignment**
  - **Validates: Requirements 4.2, 4.3, 4.4**

- [x] 3.4 Implement power spike detection logic

  - Check if state is 'on'
  - Compare powerW to basePowerW * 1.3
  - Calculate severity based on ratio
  - Generate descriptive message
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 3.5 Write property tests for spike detection



  - **Property 11: Power spike detection**
  - **Validates: Requirements 5.1**
  - **Property 12: Spike severity assignment**
  - **Validates: Requirements 5.2, 5.3, 5.4, 5.5**

- [x] 3.6 Write property test for anomaly structure



  - **Property 10: Anomaly structure completeness**
  - **Validates: Requirements 4.5**

- [x] 4. Create Express API endpoints





  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 4.1 Implement GET /api/devices endpoint

  - Call simulateDevices()
  - Return JSON array of devices
  - _Requirements: 8.2_

- [x] 4.2 Implement GET /api/anomalies endpoint

  - Call simulateDevices()
  - Call detectAnomalies()
  - Return JSON array of anomalies
  - _Requirements: 8.4_


- [x] 4.3 Implement GET /api/telemetry endpoint (optional)

  - Generate complete telemetry snapshot
  - Calculate summary statistics
  - Return comprehensive JSON response
  - _Requirements: 8.2, 8.3, 8.4_



- [x] 4.4 Write integration tests for API endpoints


  - Test /api/devices returns valid device array
  - Test /api/anomalies returns valid anomaly array
  - Test response status codes and headers
  - _Requirements: 8.2, 8.4_

- [x] 5. Implement React App component and state management





  - _Requirements: 7.1, 7.2, 7.3, 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 5.1 Create App component with state hooks

  - Initialize theme state from localStorage
  - Initialize devices and anomalies state
  - Implement theme toggle handler
  - Apply theme class to body element
  - _Requirements: 7.1, 7.2, 7.3_

- [x] 5.2 Write property tests for theme management



  - **Property 17: Theme toggle behavior**
  - **Validates: Requirements 7.2**
  - **Property 18: Theme persistence**
  - **Validates: Requirements 7.3**

- [x] 5.3 Implement data fetching with polling

  - Create fetchData function
  - Fetch from /api/devices and /api/anomalies
  - Update state with received data
  - Set up 3-second interval with useEffect
  - Clean up interval on unmount
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 5.4 Add error handling for network failures

  - Wrap fetch calls in try-catch
  - Log errors to console
  - Continue polling despite errors
  - _Requirements: 8.5_

- [x] 5.5 Write property test for data propagation



  - **Property 19: Telemetry data propagation**
  - **Validates: Requirements 8.2, 8.3, 8.4**

- [x] 5.6 Calculate total power consumption

  - Sum powerW values from all devices
  - Pass to UsageGauge component
  - _Requirements: 3.1_

- [x] 5.7 Write property test for total power calculation


  - **Property 5: Total power calculation**
  - **Validates: Requirements 3.1**


- [x] 6. Create Header component




  - _Requirements: 7.2_

- [x] 6.1 Implement Header component


  - Display application title with ghost emoji
  - Render theme toggle button
  - Show moon icon for light theme, sun icon for dark theme
  - Call onToggleTheme callback on button click
  - Apply theme-specific styling
  - _Requirements: 7.2_

- [x] 6.2 Write unit tests for Header component



  - Test rendering with different themes
  - Test toggle button click handler
  - Test icon display based on theme
  - _Requirements: 7.2_
-

- [x] 7. Create HouseMap component with SVG visualization



  - _Requirements: 1.1, 1.2, 1.3_

- [x] 7.1 Implement HouseMap component


  - Define room position mapping object
  - Render SVG with viewBox
  - Draw room rectangles with dashed borders
  - Add room labels
  - _Requirements: 1.1_

- [x] 7.2 Add device icon rendering


  - Map devices to room positions
  - Render circles with state-based colors
  - Add device emoji icons
  - Display power consumption below icons
  - _Requirements: 1.2, 1.3_

- [x] 7.3 Write property tests for device positioning and coloring



  - **Property 1: Device icon positioning**
  - **Validates: Requirements 1.2**
  - **Property 2: State color mapping**
  - **Validates: Requirements 1.3, 2.4, 2.5, 2.6**

- [x] 8. Create DeviceList component





  - _Requirements: 2.1, 2.3, 2.4, 2.5, 2.6_

- [x] 8.1 Implement DeviceList component






  - Map over devices array
  - Render device cards with name, room, state, power
  - Display state badges with appropriate colors
  - Format power consumption with one decimal place
  - Add hover effects
  - _Requirements: 2.1, 2.3, 2.4, 2.5, 2.6_

- [x] 8.2 Write property tests for device list rendering



  - **Property 3: Device list completeness**
  - **Validates: Requirements 2.1**
  - **Property 4: Power consumption formatting**
  - **Validates: Requirements 2.3**


- [x] 9. Create UsageGauge component




  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 9.1 Implement UsageGauge component

  - Display total power in large format
  - Calculate daily cost using formula
  - Format cost with two decimal places
  - Display device count
  - Apply theme-specific accent colors
  - _Requirements: 3.2, 3.3, 3.4, 3.5_

- [x] 9.2 Write property tests for usage calculations



  - **Property 6: Daily cost calculation**
  - **Validates: Requirements 3.3, 3.4**
  - **Property 7: Device count accuracy**
  - **Validates: Requirements 3.5**


- [x] 10. Create AnomalyPanel component




  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 10.1 Implement AnomalyPanel component


  - Map over anomalies array
  - Render anomaly cards with type, severity, details
  - Display color-coded severity badges
  - Show device name by looking up deviceId
  - Format timestamps as relative time
  - Display estimated cost
  - Show empty state message when no anomalies
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_


- [x] 10.2 Implement relative timestamp formatting function

  - Calculate time difference in milliseconds
  - Convert to minutes, hours, or days
  - Return formatted string (e.g., "5m ago")
  - _Requirements: 6.4_


- [x] 10.3 Write property tests for anomaly display


  - **Property 13: Anomaly display completeness**
  - **Validates: Requirements 6.1**
  - **Property 14: Severity badge color mapping**
  - **Validates: Requirements 6.2**
  - **Property 15: Anomaly details presence**
  - **Validates: Requirements 6.3**
  - **Property 16: Relative timestamp formatting**
  - **Validates: Requirements 6.4**


- [x] 11. Create CSS styling with theme support




  - _Requirements: 7.4, 7.5_

- [x] 11.1 Implement base styles and layout

  - Reset default styles
  - Create grid layout for main content
  - Style card components
  - Add responsive design rules
  - _Requirements: 7.4, 7.5_


- [x] 11.2 Implement light theme styles

  - Define warm color palette
  - Apply cornsilk background
  - Use saddle brown for primary elements
  - Add crimson accents
  - _Requirements: 7.4_



- [x] 11.3 Implement dark theme styles

  - Define cool color palette
  - Apply dark purple background
  - Use magenta for primary elements
  - Add orange-red accents
  - _Requirements: 7.5_




- [x] 11.4 Add component-specific styles







  - Style device items and state badges
  - Style anomaly cards with severity borders
  - Style gauge display
  - Add hover effects and transitions
  - _Requirements: 2.4, 2.5, 2.6, 6.2_


- [x] 12. Create HTML entry point and React root




  - _Requirements: 1.1_



- [x] 12.1 Create index.html

  - Set up HTML structure
  - Add root div
  - Link to main.jsx
  - _Requirements: 1.1_




- [x] 12.2 Create main.jsx







  - Import React and ReactDOM
  - Import App component and styles
  - Render App to root element
  - _Requirements: 1.1_


- [x] 13. Configure build tools




  - _Requirements: All_

- [x] 13.1 Configure Vite


  - Set up React plugin
  - Configure dev server port (3000)
  - Set up proxy to backend (localhost:3001)
  - _Requirements: 8.1_

- [x] 13.2 Create server start script


  - Add dev script to server package.json
  - Ensure server runs on port 3001
  - _Requirements: 8.1_

- [x] 14. Final checkpoint - Ensure all tests pass
  - Run all unit tests
  - Run all property-based tests
  - Verify API endpoints work correctly
  - Test frontend-backend integration
  - Verify theme switching works
  - Check anomaly detection accuracy
  - Ask the user if questions arise

- [ ] 15. Enhance visual theme with haunted effects
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 15.1 Update color palette to darker haunted theme
  - Replace existing colors with new palette (#0A0A0F background, #00FF9C neon green, etc.)
  - Update CSS variables for theme colors
  - Apply colors to all components
  - _Requirements: 10.1_

- [ ] 15.2 Implement fog overlay effect
  - Create fog overlay div with gradient
  - Add CSS keyframe animation for slow drift
  - Position as fixed overlay with pointer-events: none
  - _Requirements: 10.1_

- [ ] 15.3 Add flicker animation to header
  - Create CSS keyframe for opacity flicker
  - Apply animation to header elements
  - Use random timing for realistic effect
  - _Requirements: 10.2_

- [ ] 15.4 Implement neon glow pulse effect
  - Create CSS keyframe for box-shadow pulse
  - Apply to high-usage devices and gauge
  - Vary intensity based on power level
  - _Requirements: 10.3_

- [ ] 15.5 Add glitch animation for anomalies
  - Create CSS keyframe for horizontal offset and color separation
  - Trigger animation when new anomalies appear
  - Apply to anomaly panel
  - _Requirements: 10.4_

- [ ] 15.6 Implement floating particles effect
  - Create particle elements with CSS
  - Add keyframe animation for vertical float
  - Position randomly across viewport
  - _Requirements: 10.5_

- [ ] 16. Update polling interval to 1-2 seconds
  - _Requirements: 8.1_

- [ ] 16.1 Change polling interval in App component
  - Update setInterval from 3000ms to 1500ms
  - Test that updates are smooth and performant
  - _Requirements: 8.1_

- [ ] 17. Implement room glow effects on house map
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [ ] 17.1 Calculate room power consumption
  - Group devices by room
  - Sum power values for each room
  - Pass room power data to HouseMap component
  - _Requirements: 12.1_

- [ ]* 17.2 Write property test for room power calculation
  - **Property 24: Room power calculation**
  - **Validates: Requirements 12.1**

- [ ] 17.3 Add glow effects to room rectangles
  - Apply CSS filter or box-shadow based on room power
  - Implement dim/medium/bright glow levels
  - Add pulsing animation for high-usage rooms
  - _Requirements: 12.2, 12.3, 12.4_

- [ ]* 17.4 Write property test for glow intensity mapping
  - **Property 25: Room glow intensity mapping**
  - **Validates: Requirements 12.2, 12.3, 12.4**

- [ ] 17.5 Add hover intensification effect
  - Increase glow on room hover
  - Use CSS :hover pseudo-class
  - _Requirements: 12.5_

- [ ] 18. Implement usage history tracking and line chart
  - _Requirements: 11.1, 11.3, 11.4, 11.5_

- [ ] 18.1 Add usage history state to App component
  - Create state array to store last 60 power values
  - Update array when new telemetry arrives
  - Maintain 60-point sliding window
  - _Requirements: 11.1, 11.3_

- [ ] 18.2 Create UsageChart component
  - Implement line chart using canvas or SVG
  - Display x-axis (time) and y-axis (watts)
  - Apply theme colors
  - Add grid lines and labels
  - _Requirements: 11.1, 11.4, 11.5_

- [ ]* 18.3 Write property test for chart data points
  - **Property 26: Chart data point count**
  - **Validates: Requirements 11.1**

- [ ] 19. Implement device bar chart
  - _Requirements: 11.2, 11.4, 11.5_

- [ ] 19.1 Create DeviceChart component
  - Implement bar chart using SVG or canvas
  - Display one bar per device
  - Label bars with device names
  - Show power values on bars
  - Apply theme colors
  - _Requirements: 11.2, 11.4, 11.5_

- [ ]* 19.2 Write property test for bar chart completeness
  - **Property 27: Bar chart device completeness**
  - **Validates: Requirements 11.2**

- [ ] 20. Integrate charts into dashboard layout
  - _Requirements: 11.1, 11.2_

- [ ] 20.1 Add charts to App component
  - Import UsageChart and DeviceChart
  - Position in grid layout
  - Pass appropriate props
  - Ensure responsive sizing
  - _Requirements: 11.1, 11.2_

- [ ] 21. Final polish and testing
  - _Requirements: All_

- [ ] 21.1 Test all visual effects
  - Verify fog overlay animates smoothly
  - Check flicker effect on header
  - Confirm glow pulse on high usage
  - Test glitch animation on anomalies
  - Verify particles float correctly
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 21.2 Test charts update in real-time
  - Verify line chart updates with new data
  - Confirm bar chart reflects current values
  - Check chart animations are smooth
  - _Requirements: 11.3_

- [ ] 21.3 Test room glow effects
  - Verify glow intensity matches power levels
  - Check hover effects work
  - Confirm pulsing on high-usage rooms
  - _Requirements: 12.2, 12.3, 12.4, 12.5_

- [ ] 21.4 Performance optimization
  - Check polling doesn't cause performance issues
  - Verify animations are smooth (60fps)
  - Optimize re-renders if needed
  - Test on different browsers
  - _Requirements: 8.1_

- [ ] 21.5 Final checkpoint - Ensure all tests pass
  - Run all unit tests
  - Run all property-based tests
  - Verify all visual effects work
  - Test complete user experience
  - Ask the user if questions arise
