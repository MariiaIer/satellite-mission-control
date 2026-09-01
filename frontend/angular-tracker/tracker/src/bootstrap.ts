import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { SpaceConsoleComponent } from './app/components/space-console/space-console.component';

export function mountTracker(container: HTMLElement) {
  container.innerHTML = '';
  const appElement = document.createElement('app-space-console');
  container.appendChild(appElement);

  return bootstrapApplication(SpaceConsoleComponent, appConfig);
}

export default mountTracker;