// WebSocket stub for future implementation
// Feature flag: FEATURE_WS

export interface WSConnection {
  send(data: unknown): void;
  close(): void;
}

export class WebSocketManager {
  private connections = new Map<string, WSConnection>();

  addConnection(id: string, connection: WSConnection): void {
    this.connections.set(id, connection);
  }

  removeConnection(id: string): void {
    this.connections.delete(id);
  }

  sendToConnection(id: string, data: unknown): boolean {
    const conn = this.connections.get(id);
    if (!conn) return false;
    try {
      conn.send(data);
      return true;
    } catch (error) {
      this.removeConnection(id);
      return false;
    }
  }

  broadcast(data: unknown): void {
    this.connections.forEach((conn) => {
      try {
        conn.send(data);
      } catch (error) {
        // Connection likely closed
      }
    });
  }
}

