# Socket.io Connection Flow Guide

## Application Startup Sequence

```
Browser Page Load
       ↓
1. Load HTML/CSS/JS
       ↓
2. React App Initializes
       ↓
3. Layout.tsx Renders
       ↓
4. SocketInitializer Component Mounts
       ↓
5. useEffect Hook Fires
       ↓
6. initSocket() Called
       ↓
   Socket.io Handshake Begins
   ├─ Client: Connects to ws://localhost:3000/api/socket
   ├─ Server: Accepts connection
   ├─ Server: Generates socket ID
   └─ Server: Sends initial metrics
       ↓
7. 'connect' Event Fired
       ↓
8. Page Components Mount
   ├─ MetricsGrid
   │   └─ useSocketMetrics() hook subscribes
   ├─ ThreatChart
   │   └─ useSocketChartData() hook subscribes
   └─ RecentIncidents
       └─ useSocketIncidents() hook subscribes
       ↓
9. Green "Live real-time updates enabled ⚡" Indicator Shows
       ↓
10. Dashboard Ready for Real-Time Updates
```

---

## Real-Time Event Broadcasting

```
Server Timeline (Every 10 Seconds)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

T:00s
├─ generateMetrics()
├─ io.emit('metrics:update', metrics) → All Clients
├─ Math.random() < 0.3? → 30% chance
│  └─ If true: generateThreat()
│     └─ io.emit('threats:new', threat) → All Clients
├─ Math.random() < 0.2? → 20% chance
│  └─ If true: generateIncidentUpdate()
│     └─ io.emit('incidents:update', incident) → All Clients
└─ generateChartPoint()
   └─ io.emit('chart:update', point) → All Clients

T:10s (Repeat...)
```

---

## Component Data Update Flow

### MetricsGrid Example

```
Browser Receives 'metrics:update' Event
       ↓
Socket.io-client Triggers Callback
       ↓
useSocketMetrics Hook onMetricsUpdate Function Called
       ↓
setMetrics(data) Updates React State
       ↓
Component Re-Renders
       ↓
MetricCard Values Update
       ↓
User Sees New Numbers Displayed
       ↓
Timestamp: ~100ms
```

### ThreatChart Example

```
Browser Receives 'chart:update' Event
       ↓
useSocketChartData Hook onChartUpdate Called
       ↓
setChartData(prev => [...prev, newPoint].slice(-30))
       ↓
Recharts LineChart Re-Renders
       ↓
New Point Appears on Chart
       ↓
Line Extends Right
       ↓
User Sees Live Chart Growth
```

---

## Connection State Management

```
Possible States:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. DISCONNECTED (Initial)
   ├─ useSocketConnection() → false
   ├─ useSocketMetrics() → undefined
   └─ Dashboard shows: Loading...

2. CONNECTING (Handshake)
   ├─ Socket emits: connect_error (if fails)
   └─ Auto-retry (up to 5 attempts)

3. CONNECTED ✓
   ├─ useSocketConnection() → true
   ├─ useSocketMetrics() → metrics
   ├─ Dashboard shows: Live indicator ⚡
   └─ Real-time data streams in

4. DISCONNECTED (Later)
   ├─ Socket emits: disconnect
   ├─ Auto-reconnect begins
   ├─ useSocketMetrics() → last cached data
   └─ Dashboard shows: Falls back to API

5. ERROR
   ├─ Socket emits: error
   ├─ Logs error message
   └─ User can retry manually
```

---

## Hook Subscription Lifecycle

### useSocketMetrics Hook

```
Component Mounts
       ↓
useEffect Runs
       ↓
initSocket() Creates/Gets Socket
       ↓
socket.on('connect', ...) Listener Added
       ↓
onMetricsUpdate(callback) Called
       ↓
socket.on('metrics:update', callback) Listener Added
       ↓
Component Ready for Updates

When Event Arrives:
       ↓
callback(data) Executes
       ↓
setMetrics(data) State Updates
       ↓
Component Re-Renders

Component Unmounts:
       ↓
useEffect Cleanup Runs
       ↓
socket.off('metrics:update', callback) Listener Removed
       ↓
No Memory Leaks ✓
```

---

## Network Communication Timeline

```
Time    Browser                              Server
────────────────────────────────────────────────────────

T:0s    [Connect to /api/socket]
        ──────────────────────────→ [Accept connection]
        
T:1s    ← ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ← [Send initial metrics]
        [Receive metrics:update]
        [Set state, re-render]
        
T:10s   [Listening for events]
        ← ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ← [Broadcast metrics:update]
        [Receive update]
        [State updates]
        [Re-render]
        
T:10s   ← ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ← [30% chance: threats:new]
        [Receive new threat]
        [Add to threat list]
        [Alert fires]
        
T:20s   [Still listening]
        ← ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ← [Broadcast all 4 events]
        [Multiple updates]
        [Batched re-renders]
        
...     [Continues until disconnect]
```

---

## Error Recovery Flow

```
Socket Disconnects
       ↓
socket.on('disconnect') Fires
       ↓
useSocketConnection() → false
       ↓
useSocketMetrics() Falls Back to Last Cached Data
       ↓
Dashboard Shows: Stale Data (from last update)
       ↓
Auto-Reconnect Begins
       ├─ Attempt 1: T+1s
       ├─ Attempt 2: T+2s
       ├─ Attempt 3: T+4s
       ├─ Attempt 4: T+8s
       └─ Attempt 5: T+16s
       ↓
If Reconnect Succeeds:
       ├─ socket.on('connect') Fires
       ├─ useSocketConnection() → true
       ├─ useSocketMetrics() → Fresh Data
       └─ Dashboard: Live ⚡ Indicator Returns
       ↓
If All Attempts Fail:
       ├─ socket.io Stops Retrying
       ├─ Manual Reconnect Required
       └─ User Stays on Cached Data
```

---

## Multiple Client Synchronization

```
Client A                Server              Client B
─────────                ────────            ─────────

Connects ──────────────→ [Connected] ←──────── Connects
                         [Socket ID: A]
                         [Socket ID: B]
                              ↓
                         Broadcast Event
                              ↓
        ← ────────────── metrics:update
        [Update state]
        [Re-render]       metrics:update ──────→ [Update state]
                                                [Re-render]
        
        ← ────────────── threats:new
        [New threat alert]
                                  threats:new ──→ [New threat alert]

        Both clients see same data in near-real-time
        with ~50-100ms latency difference
```

---

## Data Consistency Example

```
Scenario: Threat Count Update

Server Metrics
  threatsDetected: 1247
       ↓
emit('metrics:update', {
  threatsDetected: 1247,
  ...
})
       ↓
All Connected Clients Receive Same Data

Client A: threatsDetected = 1247
Client B: threatsDetected = 1247
Client C: threatsDetected = 1247

All Dashboards Show Same Count ✓
```

---

## Reconnection Strategy

```
Connected
    ↓
Connection Lost (Network Error/Server Down)
    ↓
socket.io Automatic Reconnection
    ├─ Initial Delay: 1000ms
    ├─ Max Delay: 5000ms
    ├─ Max Attempts: 5
    └─ Exponential Backoff
       ├─ 1000ms → 1st attempt
       ├─ 2000ms → 2nd attempt
       ├─ 4000ms → 3rd attempt
       ├─ 5000ms → 4th attempt (maxed)
       └─ 5000ms → 5th attempt
       ↓
Reconnection Success?
    ├─ Yes → Back to Connected State
    │        New Events Start Streaming
    │        Dashboard Updates Resume
    │
    └─ No → Failed State
             User Can Manual Refresh
             Falls Back to REST API
             Stale Data Displayed
```

---

## Hook Dependency Lifecycle

```
useSocketMetrics Hook Depends On:
[] (empty array)
   ↓
   Means: Hook only runs once on component mount
   ↓
   Effect runs: ✓ On mount
   Effect runs: ✗ On prop change
   Effect runs: ✗ On state update
   Effect runs: ✗ On dependency change
   ↓
   Cleanup runs: ✓ On component unmount
   ↓
   Result: Stable subscription throughout component lifetime
```

---

## Performance Timeline

```
Event Generation:     10s interval (Server)
Event Broadcast:      < 1ms (Socket.io)
Network Latency:      ~20-50ms (Typical)
Client Callback:      < 1ms (Receive)
State Update:         < 1ms (React)
Component Re-Render:  5-50ms (Depends on DOM size)
Visual Update:        Browser repaint
────────────────────────────────
Total Latency:        ~50-100ms (User perceives as "instant")
```

---

## Debugging Connection Issues

### Check Socket Status in Console

```javascript
// Open Browser DevTools Console

// Check logs
[Socket] Connected: socket-abc123 ✓

// Verify hooks are working
[useSocketMetrics] Received update: {...} ✓

// If you don't see these:
// 1. Check Network tab → WS connection to /api/socket
// 2. Check if server is running (pnpm dev)
// 3. Check browser console for errors
// 4. Verify socket.io dependencies installed
```

### Inspect Network Traffic

```
DevTools → Network Tab → WS Filter
  ↓
Look for WebSocket connection to:
/api/socket

Should See:
- Initial connection handshake
- Messages every ~10 seconds
- Binary/text frames with event data
```

---

## Summary

Real-Time Data Path:
```
Server Data Generation
    ↓ (Every 10s)
Socket.io Broadcast
    ↓ (Instant)
Client Receives
    ↓ (< 1ms)
Hook Callback
    ↓ (< 1ms)
State Update (setMetrics)
    ↓ (< 1ms)
Component Re-Render
    ↓ (5-50ms)
User Sees Update
────────────────────
Total: ~50-100ms (Feels Real-Time)
```

This is the foundation of your real-time monitoring system! 🚀
