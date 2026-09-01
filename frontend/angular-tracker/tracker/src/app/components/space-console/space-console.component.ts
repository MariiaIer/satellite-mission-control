import { Component, OnInit, OnDestroy, ElementRef, inject, signal, effect, viewChild } from '@angular/core';
import { DatePipe, UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SpaceConsoleService } from '../../services/space-console.service';

@Component({
  selector: 'app-space-console',
  standalone: true,
  imports: [FormsModule, DatePipe, UpperCasePipe],
  templateUrl: './space-console.component.html',
  styleUrl: './space-console.component.css'
})
export class SpaceConsoleComponent implements OnInit, OnDestroy {
  private consoleService = inject(SpaceConsoleService);

  private scrollContainer = viewChild<ElementRef<HTMLDivElement>>('scrollContainer');

  inputCommand = signal('');

  isAuth = this.consoleService.isAuth;
  isConnected = this.consoleService.isConnected;
  logs = this.consoleService.logs;

  constructor() {
    effect(() => {
      this.logs();
      const container = this.scrollContainer()?.nativeElement;
      if (container) {
        requestAnimationFrame(() => {
          container.scrollTop = container.scrollHeight;
        });
      }
    });
  }

  ngOnInit(): void {
    if (this.isAuth()) {
      this.consoleService.connect();
    }
  }

  ngOnDestroy(): void {
    this.consoleService.disconnect();
  }

  sendCommand(): void {
    const text = this.inputCommand().trim();
    if (!text) return;

    this.consoleService.sendMessage(text);
    this.inputCommand.set('');
  }

  clearConsole(): void {
    this.consoleService.clearLogs();
  }
}