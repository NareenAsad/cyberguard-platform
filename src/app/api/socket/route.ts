import { NextRequest } from 'next/server'
import { initSocketServer } from '@/lib/socket-server'

// This route handles WebSocket upgrades for Socket.io
// Socket.io will upgrade HTTP connections to WebSocket when possible

export async function GET(request: NextRequest) {
    // This is handled by the Socket.io middleware
    // The actual connection happens through the upgrade mechanism
    return new Response('Socket.io endpoint', { status: 200 })
}

export async function POST(request: NextRequest) {
    return new Response('Socket.io endpoint', { status: 200 })
}
