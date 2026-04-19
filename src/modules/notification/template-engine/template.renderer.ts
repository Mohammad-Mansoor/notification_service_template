// src/modules/notification/template-engine/template.renderer.ts

import Handlebars from 'handlebars';
import path from 'path';
import { TemplateLoader } from './template.loader';
import { TemplateRenderInput, TemplateOutput } from './template.types';

/**
 * TemplateRenderer handles compilation and rendering of Handlebars templates.
 * It works with the TemplateLoader to obtain raw template strings and uses an
 * in‑memory cache (TemplateCache) to store compiled template functions for
 * maximum performance.
 */
export class TemplateRenderer {
  private readonly loader: TemplateLoader;
  private hbs: typeof Handlebars;

  constructor(loader: TemplateLoader) {
    this.loader = loader;
    this.hbs = Handlebars.create();
  }

  /**
   * Register all partials and layouts with Handlebars. Partials are any file
   * whose path includes '/partials/' and layouts any file whose path includes
   * '/layouts/'. The file name (without extension) becomes the registration
   * name.
   */
  private async registerPartialsAndLayouts(): Promise<void> {
    const allPaths = await this.loader.listTemplatePaths();
    for (const filePath of allPaths) {
      const normalized = filePath.replace(/\\/g, '/');
      if (normalized.includes('/partials/') || normalized.includes('/layouts/')) {
        const name = path
          .basename(filePath)
          .replace(/\.hbs$/, '');
        const content = await this.loader.getRawTemplate(filePath);
        if (content) {
          this.hbs.registerPartial(name, content);
        }
      }
    }
  }

  /** Compile a template (or retrieve from cache) */
  /** Compile a template freshly from disk */
  private async getCompiledTemplate(filePath: string): Promise<Handlebars.TemplateDelegate> {
    const raw = await this.loader.getRawTemplate(filePath);
    if (!raw) {
      throw new Error(`Template not found at path: ${filePath}`);
    }
    return this.hbs.compile(raw);
  }

  /** Render a specific template file with the provided data */
  private async renderTemplate(filePath: string, data: Record<string, any>): Promise<string> {
    // Re-register partials on every call to ensure they are also fresh!
    this.hbs = Handlebars.create(); 
    await this.registerPartialsAndLayouts();
    
    const templateFn = await this.getCompiledTemplate(filePath);
    console.log("data inside the renderTemplate: ", JSON.stringify(data))
    return templateFn(data);
  }

  /** Public API – render both subject and html for a given input */
  async render(input: TemplateRenderInput): Promise<TemplateOutput> {
    const { type, data } = input;
    // Resolve template paths via a convention: loader baseDir + domain + template name
    // The TemplateEngine will provide absolute paths; here we just render.
    // For flexibility we expect the caller to pass full paths for subject and html.
    // This method is kept generic – it simply renders the supplied paths.
    // The actual path resolution lives in TemplateEngine.
    // Placeholder implementation – will be overridden by TemplateEngine.
    throw new Error('TemplateRenderer.render should be called via TemplateEngine with concrete paths');
  }

  /** Helper used by TemplateEngine to render a specific file */
  async renderFile(filePath: string, data: Record<string, any>): Promise<string> {
    return await this.renderTemplate(filePath, data);
  }
}
