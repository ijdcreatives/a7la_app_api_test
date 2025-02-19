import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import { CHAT_DOCUMENTATION } from '../_modules/chat/docs/chat.swagger';

export const swaggerConfig = (app: INestApplication) => {
  const configService = app.get(ConfigService);
  const getEnv = (key: string) => configService.get<string>(key) || '';

  const prefix = getEnv('API_PREFIX') || '';

  // REST API Documentation
  const restApiConfig = new DocumentBuilder()
    .setTitle(getEnv('PROJECT_NAME'))
    .setDescription(getEnv('PROJECT_DESCRIPTION'))
    .setVersion('1.0')
    .setContact(
      getEnv('PROJECT_CONTACT_NAME'),
      getEnv('PROJECT_CONTACT_URL'),
      getEnv('PROJECT_CONTACT_EMAIL'),
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
      },
      'ACCESS Token',
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
      },
      'FORGET_PASSWORD Token',
    )
    .addGlobalParameters({
      in: 'header',
      required: false,
      name: 'Locale',
      schema: {
        example: 'en',
      },
    })
    .build();

  const restApiDocument = SwaggerModule.createDocument(app, restApiConfig);

  // Real-time API Documentation
  const realtimeApiConfig = new DocumentBuilder()
    .setTitle(`${getEnv('PROJECT_NAME')} - Real-time API`)
    .setDescription(
      `
# Real-time API Documentation

This documentation covers all real-time features using WebSocket connections.

## Connection
To connect to the WebSocket server:
\`\`\`typescript
const socket = io('YOUR_SERVER_URL', {
  auth: { token: 'YOUR_JWT_TOKEN' }
});
\`\`\`

## Testing WebSocket Events
Use the interactive console below to test WebSocket events:

<div class="websocket-test-console">
  <div class="connection-panel">
    <h3>WebSocket Connection</h3>
    <div class="form-group">
      <label for="ws-url">Server URL:</label>
      <input type="text" id="ws-url" value="${getEnv('APP_URL') || 'http://localhost:3000'}/chat" />
    </div>
    <div class="form-group">
      <label for="ws-token">Auth Token:</label>
      <input type="text" id="ws-token" placeholder="Bearer token" />
    </div>
    <button onclick="connectWebSocket()">Connect</button>
    <button onclick="disconnectWebSocket()">Disconnect</button>
    <div id="ws-status">Not connected</div>
  </div>

  <div class="event-panel">
    <h3>Event Testing</h3>
    <select id="event-select" onchange="updatePayloadExample()">
      ${Object.entries(CHAT_DOCUMENTATION.websocket.events)
        .map(
          ([event, config]) =>
            `<option value="${event}" data-example='${JSON.stringify(config?.emit?.testExample || {})}'>${event}</option>`,
        )
        .join('\n')}
    </select>
    <div class="form-group">
      <label for="event-payload">Payload:</label>
      <textarea id="event-payload" placeholder="Enter JSON payload"></textarea>
    </div>
    <button onclick="emitEvent()">Send Event</button>
  </div>

  <div class="logs-panel">
    <h3>Event Logs</h3>
    <div id="ws-logs"></div>
  </div>
</div>

<script src="https://cdn.socket.io/4.7.2/socket.io.min.js"></script>
<script>
let socket;

function connectWebSocket() {
  const url = document.getElementById('ws-url').value;
  const token = document.getElementById('ws-token').value;

  try {
    socket = io(url, {
      auth: { token },
      transports: ['websocket'],
      forceNew: true
    });

    socket.on('connect', () => {
      document.getElementById('ws-status').textContent = 'Connected';
      document.getElementById('ws-status').className = 'connected';
      logEvent('System', 'Connected to WebSocket server');
    });

    socket.on('connect_error', (error) => {
      document.getElementById('ws-status').textContent = 'Connection failed';
      document.getElementById('ws-status').className = 'error';
    });

    socket.on('disconnect', () => {
      document.getElementById('ws-status').textContent = 'Disconnected';
      document.getElementById('ws-status').className = 'disconnected';
    });
  } catch (error) {
    console.log('Error', error);
  }
}

function disconnectWebSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

function updatePayloadExample() {
  const select = document.getElementById('event-select');
  const example = select.options[select.selectedIndex].dataset.example;
  document.getElementById('event-payload').value = JSON.stringify(JSON.parse(example || '{}'), null, 2);
}

function emitEvent() {
  if (!socket?.connected) {
    alert('Please connect to WebSocket first');
    return;
  }

  const eventName = document.getElementById('event-select').value;
  const payload = document.getElementById('event-payload').value;

  try {
    const parsedPayload = JSON.parse(payload);
    socket.emit(eventName, parsedPayload);
  } catch (error) {
    console.log('Error', 'Invalid JSON payload');
  }
}


window.onload = () => {
  updatePayloadExample();
};
</script>

## Available Events
- Join Room: ${CHAT_DOCUMENTATION.websocket.events['join_room']?.description || ''}
- Send Message: ${CHAT_DOCUMENTATION.websocket.events['send_message']?.description || ''}
- Message Status: Track delivery and read status of messages
- Typing Indicators: Real-time typing status updates
- User Status: Track online/offline status of users
      `,
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
      },
      'ACCESS Token',
    )
    .addTag('WebSocket Events', 'Real-time communication events')
    .build();
  const realtimeApiDocument = SwaggerModule.createDocument(
    app,
    realtimeApiConfig,
    {
      include: [],
    },
  );

  // Remove all paths to hide REST endpoints
  realtimeApiDocument.paths = {};

  // Add WebSocket documentation
  realtimeApiDocument['components'] = {
    securitySchemes: realtimeApiDocument.components?.securitySchemes,
    schemas: {
      WebSocketEvents: {
        type: 'object',
        properties: CHAT_DOCUMENTATION.websocket.events,
      },
    },
  };

  // Add WebSocket section
  realtimeApiDocument['x-websocket'] = {
    description: CHAT_DOCUMENTATION.websocket.description,
    events: CHAT_DOCUMENTATION.websocket.events,
  };

  // Keep only WebSocket Events tag
  realtimeApiDocument.tags = [
    {
      name: 'WebSocket Events',
      description: 'Real-time communication events',
    },
  ];

  // Setup REST API documentation
  SwaggerModule.setup(`${prefix}/docs`, app, restApiDocument);

  SwaggerModule.setup(`${prefix}/realtime-docs`, app, realtimeApiDocument, {
    ...({
      explorer: true,
      // customJs: ['https://cdn.socket.io/4.3.2/socket.io.min.js'],
      customCssUrl: ['@/src/public/swagger-custom.css'],
      customJs: ['src/public/swagger-custom.js'], // 👈 Include the custom JavaScript file
      customSiteTitle: 'Real-time API Documentation',
      customOptions: {
        persistAuthorization: true,
        displayRequestDuration: false,
        filter: false,
        showExtensions: true,
      },
    } as unknown as SwaggerCustomOptions),
  });
};
