# WebSocket Real-Time Integration - CyberGuard Dashboard

## Overview

The CyberGuard dashboard now features real-time updates powered by Socket.io WebSocket integration. Dashboard metrics, threat feeds, incident updates, and chart data are streamed live to all connected clients without requiring page refreshes.

## Architecture

### Server-Side (`server.js`)
- Custom Node.js HTTP server with Socket.io integration
- Runs alongside Next.js (on the same port)
- Emits mock real-time data to all connected clients every 10 seconds
- Handles client connections and disconnections

### Client-Side
- **Socket Initialization** (`lib/socket.ts`): Manages WebSocket connection lifecycle
- **Custom Hooks** (`hooks/use-socket-events.ts`): React hooks for subscribing to real-time events
- **Socket Component** (`components/socket-initializer.tsx`): Initializes socket connection on app load

## Real-Time Events

The following events are broadcasted from the server to all connected clients:

### 1. **metrics:update**
Emitted every 10 seconds with dashboard metrics:
```javascript
{
  threatsDetected: number,
  threatsDetectedChange: number,
  riskScore: number,
  riskScoreChange: number,
  incidentsActive: number,
  incidentsActiveChange: number,
  systemsMonitored: number,
  systemsMonitoredChange: number
}
```
**Consumer**: `MetricsGrid` component via `useSocketMetrics()` hook

### 2. **threats:new**
Emitted with 30% probability when new threat is detected:
```javascript
{
  id: string,
  type: string,
  severity: 'Critical' | 'High' | 'Medium' | 'Low',
  source: string,
  timestamp: string (ISO),
  status: string,
  affectedSystems: number
}
```
**Consumer**: Threat feed components via `useSocketThreats()` hook

### 3. **incidents:update**
Emitted with 20% probability for incident status changes:
```javascript
{
  id: string,
  title: string,
  status: 'Open' | 'In Progress' | 'Resolved' | 'On Hold',
  severity: string,
  timestamp: string (ISO)
}
```
**Consumer**: Recent incidents via `useSocketIncidents()` hook

### 4. **chart:update**
Emitted every 10 seconds with threat chart data point:
```javascript
{
  name: string (HH:MM format),
  threats: number,
  detected: number,
  timestamp: string (ISO)
}
```
**Consumer**: Threat charts via `useSocketChartData()` hook

## Usage in Components

### Example: Using Real-Time Metrics
```tsx
import { useSocketMetrics } from '@/hooks/use-socket-events'

export function MyComponent() {
  const { metrics, isConnected } = useSocketMetrics(initialData)
  
  return (
    <div>
      {isConnected && <span>Live updates active</span>}
      <MetricsDisplay metrics={metrics} />
    </div>
  )
}
```

### Example: Using Real-Time Chart Data
```tsx
import { useSocketChartData } from '@/hooks/use-socket-events'

export function ChartComponent() {
  const chartData = useSocketChartData(initialData)
  
  return <ThreatChart data={chartData} />
}
```

### Example: Using Real-Time Incidents
```tsx
import { useSocketIncidents } from '@/hooks/use-socket-events'

export function IncidentsComponent() {
  const { incidents, latestIncident } = useSocketIncidents(initialData)
  
  return (
    <div>
      {latestIncident && <NewIncidentAlert incident={latestIncident} />}
      <IncidentList incidents={incidents} />
    </div>
  )
}
```

## Development Setup

### Prerequisites
- Node.js 16+ with npm/pnpm
- Socket.io and Socket.io-client dependencies installed

### Starting the Server
```bash
# Install dependencies
pnpm install

# Start development server with WebSocket support
pnpm dev

# Server will start on http://localhost:3000
# Socket.io will listen on ws://localhost:3000/api/socket
```

### Testing Real-Time Updates
1. Open http://localhost:3000 in your browser
2. Open browser DevTools console
3. Watch for `[Socket] Connected` and `[useSocket*]` log messages
4. Dashboard metrics will update every 10 seconds automatically
5. New threats, incidents, and chart points appear in real-time

## Production Considerations

For production deployment:

1. **Custom Data Source**: Replace the mock data generator in `server.js` with real threat data from your security backend
2. **Authentication**: Add Socket.io authentication middleware to validate users
3. **Scaling**: For horizontal scaling, implement Redis adapter for Socket.io:
   ```javascript
   import { createAdapter } from '@socket.io/redis-adapter'
   io.adapter(createAdapter(pubClient, subClient))
   ```
4. **Rate Limiting**: Implement rate limiting for event emissions
5. **Error Handling**: Add comprehensive error handlers and monitoring

## Fallback Behavior

The dashboard gracefully handles:
- **Socket disconnection**: Falls back to API polling via `useFetchData`
- **Initial load**: Uses API data while waiting for first socket event
- **No socket server**: Falls back to REST API only

## File Structure

```
/cyberguard/
├── server.js                          # Custom HTTP server with Socket.io
├── src/
|   ├── lib/
│   ├── socket.ts                     # Socket.io client initialization
│   ├── socket-server.ts              # Server-side setup (for reference)
│   └── mock-data-generator.ts        # Mock data generation utilities
├── hooks/
│   └── use-socket-events.ts          # Custom React hooks
├── components/
│   ├── socket-initializer.tsx        # Socket connection initializer
│   └── dashboard/metrics-grid.tsx    # Updated with real-time indicator
├── app/
│   ├── layout.tsx                    # Updated to use SocketInitializer
│   ├── page.tsx                      # Dashboard page with socket integration
│   ├── metadata.ts                   # Metadata configuration
│   └── api/socket/route.ts           # Socket endpoint (for reference)
└── package.json                      # Added socket.io dependencies
```

## Troubleshooting

### Socket Connection Issues
- Check browser console for connection errors
- Verify server is running: `http://localhost:3000/api/socket` should be accessible
- Check CORS settings in `server.js` if connecting from different domain

### No Real-Time Updates
- Verify socket is connected (check console logs)
- Check mock data generator is running (logs should appear every 10 seconds)
- Inspect network tab for Socket.io messages
- Verify event handlers are properly subscribed

### High Memory Usage
- Mock data generator may accumulate data, check memory usage
- Consider implementing data cleanup for production data sources
- Review Socket.io connection pool settings

## Future Enhancements

Potential improvements for the real-time system:

1. **Event Filtering**: Allow clients to filter which events they subscribe to
2. **Data Persistence**: Store historical data for chart trends
3. **Notifications**: Client-side toast notifications for critical events
4. **User Presence**: Show online users and their current views
5. **Collaborative Features**: Real-time collaboration on incidents
6. **Analytics**: Track metrics delivery and latency

## Support

For issues or questions about the WebSocket integration:
1. Check server logs for errors
2. Review browser console for client-side errors
3. Verify network connectivity in browser DevTools
4. Check that Socket.io is properly initialized in layout.tsx
