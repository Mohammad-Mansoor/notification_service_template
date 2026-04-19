// src/modules/notification/template-engine/template.engine.ts

import { TemplateLoader } from './template.loader';
import { TemplateRenderer } from './template.renderer';
import { TemplateRegistryResolver } from './template.registry.resolver';
import { TemplateRenderInput, TemplateOutput, TemplateEventType } from './template.types';

/**
 * TemplateEngine is the façade used by the Notification service. It hides the
 * complexity of loading, caching, and rendering Handlebars templates. The
 * workflow is:
 *   1. Resolve the concrete template file paths for the given event type.
 *   2. Ensure the loader has loaded all raw templates (performed once at
 *      application start‑up).
 *   3. Render the subject and HTML using TemplateRenderer, which internally
 *      caches compiled functions for performance.
 *   4. Return a strongly‑typed {@link TemplateOutput}.
 *
 * The engine is deliberately stateless – all mutable state lives in the
 * {@link TemplateLoader} (raw templates) and {@link TemplateCache} (compiled
 * functions). This makes the service safe for concurrent use in a NestJS
 * singleton provider.
 */
export class TemplateEngine {
  private readonly loader: TemplateLoader;
  private readonly renderer: TemplateRenderer;
  private readonly registry: TemplateRegistryResolver;

  constructor(templatesBasePath: string) {
    // Initialise loader with the directory that contains the .hbs files.
    this.loader = new TemplateLoader(templatesBasePath);
    // Registry knows how to map events to concrete file locations.
    this.registry = new TemplateRegistryResolver(templatesBasePath);
    // Renderer depends on the loader (and its shared cache).
    this.renderer = new TemplateRenderer(this.loader);
  }

  /**
   * Load all templates from the filesystem. Should be called once during the
   * application bootstrap (e.g., in a NestJS module's `onModuleInit`).
   */
  async init(): Promise<void> {
    await this.loader.loadAllTemplates();
  }

  /**
   * Render a template based on an event type and payload.
   *
   * @param eventType - one of {@link TemplateEventType}
   * @param data - dynamic data passed to Handlebars
   * @returns rendered subject and html
   */
  async render(eventType: TemplateEventType, data: Record<string, any>): Promise<TemplateOutput> {
    const { htmlPath, subjectPath } = this.registry.resolve(eventType);
    
    // DEBUG: Verify that data is not stale before rendering
    console.log(`[TemplateEngine] Rendering ${eventType} with data keys:`, Object.keys(data));
    console.log(`[TemplateEngine] Device in data: ${data.deviceName || 'N/A'}, Time: ${data.loginTime || 'N/A'}, IP: ${data.ipAddress || 'N/A'}, Location: ${data.location || 'N/A'}, Browser: ${data.browser || 'N/A'}, OS: ${data.os || 'N/A'}, User Agent: ${data.userAgent || 'N/A'}`);

    // Render HTML body
    const html = await this.renderer.renderFile(htmlPath, data);
    // Render subject line
    const subject = await this.renderer.renderFile(subjectPath, data);

    return { subject, html };
  }

  /**
   * Convenience method that accepts the {@link TemplateRenderInput} shape.
   */
  async renderFromInput(input: TemplateRenderInput): Promise<TemplateOutput> {
    return this.render(input.type, input.data);
  }
}
