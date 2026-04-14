# Quick Start - WebSocket Real-Time Updates

## In 30 Seconds

```bash
# 1. Install dependencies
pnpm install

# 2. Start the development server
pnpm dev

# 3. Open http://localhost:3000
# Watch the dashboard metrics update live every 10 seconds! ✨
```

## What You'll See

- **Green "Live real-time updates enabled" indicator** above the metrics
- **Dashboard metrics** updating automatically every 10 seconds
- **New threats** appearing occasionally in real-time
- **Incident status changes** reflecting immediately
- **Chart line** growing in real-time with new data points

## How It Works

```
Your Browser
    ↓
[Socket.io Client] ← →  [Custom Server] ← → [Mock Data]
    ↓
Updates Dashboard in Real-Time
```

## Key Files

| File | Purpose |
|------|---------|
| `server.js` | Node.js server with Socket.io (replaces `next dev`) |
| `hooks/use-socket-events.ts` | React hooks for real-time data |
| `components/socket-initializer.tsx` | Initializes connection on app load |
| `lib/socket.ts` | Socket.io client utilities |
| `WEBSOCKET.md` | Full documentation |

## Testing Socket Connection

Open browser DevTools Console and look for:
```
[Socket] Connected: <socket-id>
[useSocketMetrics] Received update: {...}
[useSocketChartData] Chart update: {...}
```

Green logs = Everything working! ✅

## Common Questions

**Q: How do I use real threat data instead of mock data?**
A: Edit `server.js` and replace the mock data generation with calls to your threat detection system.

**Q: Can I deploy this to production?**
A: Yes! Socket.io works on Vercel with appropriate configuration. See `WEBSOCKET.md` for details.

**Q: What if the socket disconnects?**
A: The dashboard automatically falls back to the REST API. Look for manual data refresh in that case.

**Q: How often do updates happen?**
A: Every 10 seconds (metrics and chart). Threats and incidents appear randomly (30% and 20% chance respectively).

## Next Steps

1. ✅ Start the server (`pnpm dev`)
2. ✅ Verify real-time updates are working
3. 📖 Read `WEBSOCKET.md` for full documentation
4. 🔧 Integrate your real threat data source
5. 🔐 Add authentication for production

## Documentation Files

- **WEBSOCKET.md** - Complete technical documentation
- **REALTIME_IMPLEMENTATION.md** - Implementation details
- **QUICK_START.md** - This file

## Architecture Overview

```
┌─────────────────────────────────────┐
│    Next.js App (http://localhost)   │
├─────────────────────────────────────┤
│ Socket.io Client (on app load)      │
│ ↓ Subscribes to 4 event types       │
│ · metrics:update                    │
│ · threats:new                       │
│ · incidents:update                  │
│ · chart:update                      │
└─────────────────────────────────────┘
                  ↓ WebSocket
┌─────────────────────────────────────┐
│  Node.js HTTP Server (server.js)    │
├─────────────────────────────────────┤
│ Socket.io Server                    │
│ ↓ Broadcasts every 10 seconds       │
│ · Mock metrics generator            │
│ · Mock threat generator             │
│ · Mock incident generator           │
│ · Mock chart data generator         │
└─────────────────────────────────────┘
```

## Running the Dashboard

### Development
```bash
pnpm dev
# Server runs on http://localhost:3000
# Socket.io on ws://localhost:3000/api/socket
```

### Production Build
```bash
pnpm build
pnpm start
```

---

**Ready to see real-time updates in action?** Run `pnpm dev` now! 🚀
