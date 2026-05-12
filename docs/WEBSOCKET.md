# WebSocket Documentation (docs/WEBSOCKET.md)

CyberGuard uses **Socket.io** to provide real-time updates across the dashboard. This ensures that security analysts see the latest threat data and system updates without needing to refresh their browser.

## Real-Time Architecture

The WebSocket server is integrated directly into the Next.js environment. The server emits events whenever underlying data changes, and client-side components subscribe to these events to trigger UI updates or data re-fetching.

```text
Socket.io Server (Next.js)
        │
        ├── metrics:update  →  Sidebar "Last Update" timestamp refreshes
        ├── chart:update    →  ThreatChart re-fetches latest time-series data
        ├── threats:new     →  Header notification bell rings + increment count
        ├── incidents:update→  Header notification bell rings + increment count
        └── agent:complete  →  RunAnalysisButton updates status + notification
```

## Client-Side Usage

The application uses a centralized socket initializer to manage the connection lifecycle.

```typescript
// Example usage in a React component:
import { initSocket } from '@/lib/socket/socket'
import { useEffect } from 'react'

const MyComponent = () => {
  useEffect(() => {
    const socket = initSocket()

    // Listen for new threats
    socket.on('threats:new', (data) => {
      console.log('New threat detected:', data.indicator_value)
      // Trigger local UI update or toast notification
    })

    // Listen for AI pipeline completion
    socket.on('agent:complete', (data) => {
      console.log('Pipeline finished for job:', data.job_id)
    })

    // Critical: Clean up listeners on unmount
    return () => {
      socket.off('threats:new')
      socket.off('agent:complete')
    }
  }, [])
  
  return (<div>Real-time enabled component</div>)
}
```

## Components Leveraging Real-Time Features

| Component | Subscribed Event(s) | UI Impact |
|---|---|---|
| `Header` | `threats:new`, `incidents:update`, `agent:complete` | Updates notification bell icon and popover list. |
| `Sidebar` | All data events | Refreshes the "Last Update" timestamp in the footer. |
| `RunAnalysisButton` | `agent:complete` | Transitions from "Analyzing..." to "Analysis Complete" state. |
| `ThreatChart` | `chart:update` | Triggers an immediate re-fetch of the chart datasets. |

---

> For details on the API endpoints that trigger these events, see the [API Reference](./API.md).
