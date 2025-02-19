import { CHAT_EVENTS } from '../chat.events';

export const CHAT_DOCUMENTATION = {
  websocket: {
    title: 'Chat WebSocket Documentation',
    description: `
    # Real-Time Chat System Documentation
    
    This documentation outlines the WebSocket events used in the chat system.
    
    ## Testing WebSocket Events
    Use the interactive console below to test WebSocket events in real-time.
    `,
    events: {
      [CHAT_EVENTS.JOIN_ROOM]: {
        description: 'Event emitted when user joins a chat room',
        emit: {
          payload: {
            type: 'object',
            properties: {
              roomId: {
                type: 'string',
                description: 'Unique room identifier',
              },
              userId: {
                type: 'string',
                description: 'User ID joining the room',
              },
            },
            required: ['roomId', 'userId'],
          },
          testExample: {
            roomId: 'room-123',
            userId: 'user-456',
          },
        },
        response: {
          event: CHAT_EVENTS.JOINED_ROOM,
          payload: {
            type: 'object',
            properties: {
              roomId: {
                type: 'string',
                description: 'Room identifier',
              },
              userId: {
                type: 'string',
                description: 'User ID that joined',
              },
              timestamp: {
                type: 'string',
                format: 'date-time',
                description: 'Join timestamp',
              },
            },
          },
        },
      },

      [CHAT_EVENTS.SEND_MESSAGE]: {
        description: 'Event emitted when sending a new message',
        emit: {
          payload: {
            type: 'object',
            properties: {
              roomId: {
                type: 'string',
                description: 'Room identifier',
              },
              senderId: {
                type: 'string',
                description: 'Message sender ID',
              },
              message: {
                type: 'string',
                description: 'Message content',
              },
              type: {
                type: 'string',
                enum: ['text', 'image', 'location'],
                description: 'Message type',
              },
              metadata: {
                type: 'object',
                properties: {
                  latitude: { type: 'number' },
                  longitude: { type: 'number' },
                  imageUrl: { type: 'string' },
                },
                description: 'Optional metadata based on message type',
              },
            },
            required: ['roomId', 'senderId', 'message', 'type'],
          },
          testExample: {
            roomId: 'room-123',
            senderId: 'user-456',
            message: 'Hello, World!',
            type: 'text',
          },
        },
        response: {
          event: CHAT_EVENTS.NEW_MESSAGE,
          payload: {
            type: 'object',
            properties: {
              messageId: {
                type: 'string',
                description: 'Unique message identifier',
              },
              roomId: {
                type: 'string',
                description: 'Room identifier',
              },
              senderId: {
                type: 'string',
                description: 'Message sender ID',
              },
              message: {
                type: 'string',
                description: 'Message content',
              },
              type: {
                type: 'string',
                enum: ['text', 'image', 'location'],
                description: 'Message type',
              },
              metadata: {
                type: 'object',
                description: 'Optional metadata',
              },
              timestamp: {
                type: 'string',
                format: 'date-time',
                description: 'Message timestamp',
              },
              status: {
                type: 'string',
                enum: ['sent', 'delivered', 'seen'],
                description: 'Message status',
              },
            },
          },
        },
      },

      [CHAT_EVENTS.ERROR]: {
        description: 'Error event received from server',
        emit: {
          payload: {
            type: 'object',
            properties: {
              code: {
                type: 'string',
                enum: [
                  'AUTH_ERROR',
                  'INVALID_ROOM',
                  'PERMISSION_DENIED',
                  'RATE_LIMIT',
                  'INVALID_MESSAGE',
                ],
                description: 'Error code',
              },
              message: {
                type: 'string',
                description: 'Error message',
              },
              details: {
                type: 'object',
                description: 'Additional error details',
              },
            },
          },
          testExample: {
            code: 'AUTH_ERROR',
            message: 'Invalid authentication token',
            details: {},
          },
        },
        response: {
          payload: {
            type: 'object',
            properties: {
              code: {
                type: 'string',
                enum: [
                  'AUTH_ERROR',
                  'INVALID_ROOM',
                  'PERMISSION_DENIED',
                  'RATE_LIMIT',
                  'INVALID_MESSAGE',
                ],
                description: 'Error code',
              },
              message: {
                type: 'string',
                description: 'Error message',
              },
              details: {
                type: 'object',
                description: 'Additional error details',
              },
            },
          },
        },
      },
    },
    testInterface: {
      template: `
        <div class="websocket-test-console">
          <div class="connection-panel">
            <h3>WebSocket Connection</h3>
            <div class="form-group">
              <label for="ws-url">Server URL:</label>
              <input type="text" id="ws-url" value="ws://localhost:3000" />
            </div>
            <div class="form-group">
              <label for="ws-token">Auth Token:</label>
              <input type="text" id="ws-token" placeholder="Bearer token" />
            </div>
            <div class="button-group">
              <button onclick="WebSocketTest.connect(document.getElementById('ws-url').value, document.getElementById('ws-token').value)">Connect</button>
              <button onclick="WebSocketTest.disconnect()">Disconnect</button>
            </div>
            <div id="ws-status">Not connected</div>
          </div>

          <div class="event-panel">
            <h3>Event Testing</h3>
            <div class="form-group">
              <label for="event-name">Event:</label>
              <select id="event-name">
                ${Object.entries(CHAT_EVENTS)
                  .map(
                    ([key, value]) =>
                      `<option value="${value}">${key}</option>`,
                  )
                  .join('\n')}
              </select>
            </div>
            <div class="form-group">
              <label for="event-data">Payload:</label>
              <textarea id="event-data" placeholder="Enter JSON payload"></textarea>
            </div>
            <button onclick="WebSocketTest.emit(document.getElementById('event-name').value, document.getElementById('event-data').value)">Send Event</button>
          </div>

          <div class="logs-panel">
            <h3>Event Logs</h3>
            <div id="ws-logs"></div>
          </div>
        </div>
      `,
    },
  },
};
