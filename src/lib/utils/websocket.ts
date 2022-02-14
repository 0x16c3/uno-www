import { useEffect, useState, useCallback } from 'react';

export const useWebSocket = (url: string | null) => {
  const [wsInstance, setWsInstance] = useState<WebSocket | undefined>();

  const isBrowser = typeof window !== 'undefined';

  // Call when updating the ws connection
  const updateWs = useCallback(
    (url) => {
      if (!isBrowser) return setWsInstance(undefined);

      // Close the old connection
      if (wsInstance?.readyState !== 3) wsInstance?.close(1000);

      // Create a new connection
      const newWs = new WebSocket(url);
      setWsInstance(newWs);
    },
    [wsInstance],
  );

  // (Optional) Open a connection on mount
  useEffect(() => {
    let ws: WebSocket | undefined = undefined;

    if (!url) return;

    const cleanup = () => {
      console.log('useWebSocket: Closing websocket');
      if (ws) {
        ws.close(1000);
      }
    };

    window.addEventListener('beforeunload', cleanup);

    if (wsInstance) {
      console.log('useWebSocket: wsInstance already exists, reloading');
      updateWs(url);
      ws = wsInstance;
    } else if (isBrowser) {
      console.log('useWebSocket: Opening websocket connection');
      ws = new WebSocket(url);
      setWsInstance(ws);
    }

    return () => {
      // Cleanup on unmount if ws wasn't closed already
      window.removeEventListener('beforeunload', cleanup);

      if (ws && ws?.readyState !== 3) {
        ws.close(1000);
      }
    };
  }, [url]);

  return wsInstance;
};
