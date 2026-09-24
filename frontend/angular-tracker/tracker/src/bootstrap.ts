import { createApplication } from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';
import { SpaceConsoleComponent } from './app/components/space-console/space-console.component';
import { appConfig } from './app/app.config';

export async function mount(container: HTMLElement, props: { token?: string } = {}) {
  const appRef = await createApplication(appConfig);
  
  if (!customElements.get('angular-tracker-element')) {
    const trackerElement = createCustomElement(SpaceConsoleComponent, {
      injector: appRef.injector,
    });
    customElements.define('angular-tracker-element', trackerElement);
  }

  let element = container.querySelector('angular-tracker-element');
  if (!element) {
    element = document.createElement('angular-tracker-element');
    container.appendChild(element);
  }

  if (props.token) {
    element.setAttribute('token', props.token);
  }
}
