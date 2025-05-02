// This is just a re-export of the useWebSocket hook from the context
// It makes it easier to import consistently alongside other hooks
import { useWebSocket as useWebSocketContext } from '@/contexts/WebSocketContext';

export const useWebSocket = useWebSocketContext;