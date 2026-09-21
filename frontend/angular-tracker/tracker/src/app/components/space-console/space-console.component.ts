import { 
  Component, 
  viewChild, 
  ViewEncapsulation, 
  inject, 
  DestroyRef, 
  afterNextRender, 
  afterRenderEffect, 
  signal 
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ScrollingModule, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { SpaceConsoleService, SpaceMessage } from '../../services/space-console.service';

@Component({
  selector: 'app-space-console',
  encapsulation: ViewEncapsulation.ShadowDom,
  imports: [FormsModule, DatePipe, ScrollingModule],
  templateUrl: './space-console.component.html',
  styleUrl: './space-console.component.css'
})
export class SpaceConsoleComponent {
  private readonly consoleService = inject(SpaceConsoleService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly viewport = viewChild<CdkVirtualScrollViewport>(CdkVirtualScrollViewport);

  readonly inputCommand = signal('');

  readonly isAuth = this.consoleService.isAuth;
  readonly isConnected = this.consoleService.isConnected;
  readonly logs = this.consoleService.logs;

  constructor() {
    afterNextRender(() => {
      if (this.isAuth()) {
        this.consoleService.connect();
      }
    });

    this.destroyRef.onDestroy(() => {
      this.consoleService.disconnect();
    });

    afterRenderEffect(() => {
      const logsCount = this.logs().length;
      const vp = this.viewport();

      if (vp && logsCount > 0) {
        vp.scrollToIndex(logsCount - 1, 'smooth');
      }
    });
  }

  /**
   * TrackBy function required for cdkVirtualFor performance optimization
   */
  trackByTimestamp(index: number, item: SpaceMessage): string | number {
    return item?.timestamp ?? index;
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