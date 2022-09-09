export enum SocketConnectionType {
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  DISCONNECTING = 'DISCONNECTING',
  DISCONNECTED = 'DISCONNECTED',
}

export const ERROR_MESSAGE= {
  UNAUTHORIZED: 'Not authorized. You do not have permission to access the terminal for this application.',
  DEFAULT: 'Found some error'
}