import { Injectable, signal, inject } from '@angular/core';
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
  private router = inject(Router);
  private socket?: WebSocket;

  // 1. Internal private WritableSignals
  private tokenSignal = signal<string | null>(localStorage.getItem('token'));
  private isConnectedSignal = signal<boolean>(false);
  private logsSignal = signal<SpaceMessage[]>([]);

  // 2. Public ReadonlySignals for the component
  public readonly isAuth = signal<boolean>(!!this.tokenSignal()).asReadonly();
  public readonly isConnected = this.isConnectedSignal.asReadonly();
  public readonly logs = this.logsSignal.asReadonly();

  constructor() {
    // Listen for token changes from the React microfrontend
    window.addEventListener('auth-change', (event: Event) => {
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
    });
  }

  // WebSocket connection
  connect(url: string = 'ws://localhost:3000'): void {
    const token = localStorage.getItem('token');
    if (!token) return;

    if (this.socket && this.socket.readyState === WebSocket.OPEN) return;

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

  // Send message (fixes TS2339: sendMessage error)
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

  // Clear logs (fixes TS2339: clearLogs error)
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

  // Private helper methods
  private addMessage(msg: SpaceMessage): void {
    this.logsSignal.update((currentLogs) => [...currentLogs, msg]);
  }

  private addSystemLog(text: string): void {
    this.addMessage({
      type: 'SYSTEM',
      timestamp: new Date().toISOString(),
      message: text
    });
  }
}