import { io, Socket } from 'socket.io-client'

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000'

let socket: Socket | null = null

export const initializeSocket = (token: string): Socket => {
  if (socket?.connected) return socket

  socket = io(SOCKET_URL, {
    auth: { token },
    // polling first — lets Render wake up before attempting the WebSocket
    // upgrade. Socket.io upgrades automatically once the connection is stable.
    transports: ['polling', 'websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
    reconnectionDelayMax: 30000,
  })

  return socket
}

export const getSocket = (): Socket | null => socket

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
