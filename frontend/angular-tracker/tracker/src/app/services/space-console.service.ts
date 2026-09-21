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
  private readonly MAX_LOGS_LIMIT = 1000;

  // Реактивные сигналы состояния
  private readonly tokenSignal = signal<string | null>(null);
  private readonly isConnectedSignal = signal<boolean>(false);
  private readonly logsSignal = signal<SpaceMessage[]>([]);

  // Публичные ридопли-сигналы и геттеры
  public readonly isAuth = computed(() => !!this.tokenSignal());
  public readonly isConnected = this.isConnectedSignal.asReadonly();
  public readonly logs = this.logsSignal.asReadonly();

  constructor() {
    this.initAuth();

    const handleAuthChange = async (event: Event) => {
      const customEvent = event as CustomEvent<{ token?: string | null }>;
      let newToken = customEvent.detail?.token;
      
      if (newToken === undefined) {
        const authService = await this.getAuthService();
        newToken = authService?.getAccessToken() || null;
      }
      
      this.updateTokenState(newToken ?? null);
    };

    window.addEventListener('auth-change', handleAuthChange);

    this.destroyRef.onDestroy(() => {
      window.removeEventListener('auth-change', handleAuthChange);
      this.disconnect();
    });
  }

  /**
   * 🚀 Публичный метод для установки токена напрямую из Custom Element / Компонента
   */
  public connectWithToken(token: string | null): void {
    if (!token) {
      this.updateTokenState(null);
      return;
    }
    
    if (token !== this.tokenSignal()) {
      this.updateTokenState(token);
    }
  }

  /**
   * Вспомогательный метод синхронизации состояния подключения
   */
  private updateTokenState(newToken: string | null): void {
    this.tokenSignal.set(newToken);

    if (!newToken) {
      this.disconnect();
      this.clearLogs();
    } else {
      this.connect();
    }
  }

  // Безопасное получение authService в рантайме
  private async getAuthService(): Promise<any> {
    try {
      const win = window as any;

      if (!win.sharedApp) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'http://localhost:5003/remoteEntry.js';
          script.onload = () => resolve();
          script.onerror = (err) => reject(err);
          document.head.appendChild(script);
        });
      }

      if (win.sharedApp && !win.sharedApp.__initialized) {
        if (win.sharedApp.init) {
          // @ts-ignore
          await win.sharedApp.init(__webpack_share_scopes__?.default || {});
        }
        win.sharedApp.__initialized = true;
      }

      const factory = await win.sharedApp.get('./authService');
      return factory();
    } catch {
      return null;
    }
  }

  private async initAuth(): Promise<void> {
    const authService = await this.getAuthService();
    if (!authService) return;

    let token = authService.getAccessToken();

    if (!token) {
      try {
        token = await authService.refreshAccessToken();
      } catch {
        token = null;
      }
    }

    if (token) {
      this.updateTokenState(token);
    }
  }

  public connect(url: string = 'ws://localhost:3000'): void {
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
      } catch {
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

  public sendMessage(userMessage: string): void {
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

  public clearLogs(): void {
    this.logsSignal.set([]);
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = undefined;
    }
    this.isConnectedSignal.set(false);
  }

  private addMessage(msg: SpaceMessage): void {
    this.logsSignal.update((currentLogs) => {
      const updated = [...currentLogs, msg];
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