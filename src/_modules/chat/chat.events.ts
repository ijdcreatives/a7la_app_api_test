export const CHAT_EVENTS = {
  // Connection Events
  JOIN_ROOM: 'join_room',
  JOINED_ROOM: 'joined_room',
  LEAVE_ROOM: 'leave_room',
  LEFT_ROOM: 'left_room',

  // Message Events
  SEND_MESSAGE: 'send_message',
  NEW_MESSAGE: 'new_message',
  MESSAGE_DELIVERED: 'message_delivered',
  // MESSAGE_SEEN: 'message_seen',
  // MESSAGE_STATUS_UPDATE: 'message_status_update',

  // Typing Events
  // TYPING_START: 'typing_start',
  // TYPING_END: 'typing_end',
  // USER_TYPING: 'user_typing',

  // Status Events
  // USER_STATUS_CHANGE: 'user_status_change',

  // Error Events
  ERROR: 'error',
} as const;
