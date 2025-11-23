# Haunted Oracle — Steering Document

## Purpose
Provide the consistent voice and content style for all generated UI copy (anomalies, fix suggestions, short alerts). Keep responses spooky, elegant, helpful, and concise.

## Tone
- Slightly sardonic, warm, elegant
- Use short metaphors tied to ghosts, embers, and shadows
- Provide a one-line title, one short paragraph explanation, and one actionable remediation step when appropriate

## Constraints
- **Titles**: ≤ 6 words
- **Explanation**: 1–2 short sentences
- **Remediation**: 1 actionable sentence (no technical jargon)
- Always include severity indicator (low / medium / high / critical)

## Examples

### Phantom Load Anomalies

**Low Severity - "A Quiet Thief"**
- Explanation: "A device draws power while appearing dormant — a silent drain on your reserves."
- Remediation: "Unplug the device or use a smart strip to eliminate phantom draws."

**Medium Severity - "Whispers in the Dark"**
- Explanation: "Standby power consumption exceeds normal thresholds — energy bleeds into shadow."
- Remediation: "Check device settings and consider a power strip with auto-shutoff."

**High Severity - "The Hungry Ghost"**
- Explanation: "Excessive phantom load detected — this device feeds even in slumber."
- Remediation: "Disconnect immediately and inspect for malfunction or replace the device."

### Power Spike Anomalies

**Low Severity - "A Flicker of Unrest"**
- Explanation: "Power usage rises above baseline — a minor disturbance in the flow."
- Remediation: "Monitor the device and check for recent changes in usage patterns."

**Medium Severity - "Embers Rising"**
- Explanation: "A notable surge detected — the device draws more than its usual appetite."
- Remediation: "Investigate connected loads and ensure proper ventilation for the device."

**High Severity - "Surge From Below"**
- Explanation: "A sudden spike suggests multiple loads or a fault on the same circuit."
- Remediation: "Check recent device actions, isolate devices, and schedule an inspection if it persists."

**Critical Severity - "The Tempest Awakens"**
- Explanation: "Critical power surge detected — immediate attention required to prevent damage."
- Remediation: "Shut down the device immediately and contact an electrician for inspection."

## Implementation

The Haunted Oracle messages are implemented in:
- **Backend**: `server/server.js` - `hauntedMessages` object
- **Frontend**: `client/src/components/AnomalyPanel.jsx` - Display with elegant styling

Each anomaly includes:
1. **Title** - Poetic, evocative name (≤ 6 words)
2. **Description** - Brief explanation with metaphorical language
3. **Remediation** - Clear, actionable step with lightbulb icon (💡)
4. **Cost Estimate** - Financial impact
5. **Severity Badge** - Visual indicator with glow effect
