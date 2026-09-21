import { Injectable, signal, computed, inject, DestroyRef } from '@angular/core';
import { Router } from '@angular/router';

export interface SpaceMessage {
  type: 'NOTIFICATION' | 'TELEMETRY_TRAJECTORY' | 'SYSTEM' | 'USER_COMMAND';
  timestamp: string;
  data?: any;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SpaceConsoleService {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  
  private socket?: WebSocket;

  // Maximum number of logs retained in memory to prevent performance degradation
  private readonly MAX_LOGS_LIMIT = 1000;

  // 1. Internal private WritableSignals
  private readonly tokenSignal = signal<string | null>(localStorage.getItem('token'));
  private readonly isConnectedSignal = signal<boolean>(false);
  private readonly logsSignal = signal<SpaceMessage[]>([]);

  // 2. Public ReadonlySignals
  // FIXED: Using computed() ensures isAuth stays reactive when tokenSignal changes
  public readonly isAuth = computed(() => !!this.tokenSignal());
  public readonly isConnected = this.isConnectedSignal.asReadonly();
  public readonly logs = this.logsSignal.asReadonly();

  constructor() {
    const handleAuthChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ token: string | null }>;
      const newToken = customEvent.detail?.token ?? localStorage.getItem('token');
      
      this.tokenSignal.set(newToken);

      if (!newToken) {
        this.disconnect();
        this.clearLogs();
        this.router.navigate(['/']);
      } else {
        this.connect();
      }
    };

    // Listen for token changes from microfrontends
    window.addEventListener('auth-change', handleAuthChange);

    // Clean up event listener when service scope is destroyed
    this.destroyRef.onDestroy(() => {
      window.removeEventListener('auth-change', handleAuthChange);
      this.disconnect();
    });
  }

  // WebSocket connection
  connect(url: string = 'ws://localhost:3000'): void {
    const token = this.tokenSignal();
    if (!token) return;

    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.socket = new WebSocket(`${url}?token=${token}`);

    this.socket.onopen = () => {
      this.isConnectedSignal.set(true);
      this.addSystemLog('Connection to MCC established.');
    };

    this.socket.onmessage = (event: MessageEvent) => {
      try {
        const parsedData: SpaceMessage = JSON.parse(event.data);
        this.addMessage(parsedData);
      } catch (e) {
        this.addSystemLog(`Data parsing error: ${event.data}`);
      }
    };

    this.socket.onerror = () => {
      this.addSystemLog('WebSocket connection error');
    };

    this.socket.onclose = () => {
      this.isConnectedSignal.set(false);
    };
  }

  // Send message
  sendMessage(userMessage: string): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      this.addSystemLog('Error: no connection to server.');
      return;
    }

    const payload: SpaceMessage = {
      type: 'USER_COMMAND',
      timestamp: new Date().toISOString(),
      message: userMessage
    };

    this.socket.send(JSON.stringify(payload));
    this.addMessage(payload);
  }

  // Clear logs
  clearLogs(): void {
    this.logsSignal.set([]);
  }

  // Disconnect
  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = undefined;
    }
  }

  // Helper method with memory buffer limit
  private addMessage(msg: SpaceMessage): void {
    this.logsSignal.update((currentLogs) => {
      const updated = [...currentLogs, msg];
      // Keep only the last MAX_LOGS_LIMIT records
      return updated.length > this.MAX_LOGS_LIMIT 
        ? updated.slice(updated.length - this.MAX_LOGS_LIMIT) 
        : updated;
    });
  }

  private addSystemLog(text: string): void {
    this.addMessage({
      type: 'SYSTEM',
      timestamp: new Date().toISOString(),
      message: text
    });
  }
}