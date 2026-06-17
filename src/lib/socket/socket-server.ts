/* eslint-disable @typescript-eslint/no-explicit-any */
import { Server as HTTPServer } from 'http'

const mockIoServer: any = {
    emit: () => {},
    on: () => {},
}

export function initSocketServer(httpServer: HTTPServer) {
    return mockIoServer
}

export function getSocketServer() {
    return mockIoServer
}

export function stopDataStream() {
    // No-op
}

export function startDataStream() {
    // No-op
}