// src/modules/notification/template-engine/template.loader.ts

import { promises as fs } from 'fs';
import path from 'path';
import fg from 'fast-glob';

/**
 * TemplateLoader is responsible for scanning the filesystem for Handlebars
 * template files and loading their raw contents into memory. It separates
 * templates by domain (auth, healthcare, billing) and by purpose (html,
 * subject, partial, layout). The loader does **not** compile the templates –
 * that is delegated to the renderer/cache layer.
 */
export class TemplateLoader {
  /**
   * Base directory where all email templates live.
   * Example: src/modules/notification/templates/email
   */
  private readonly baseDir: string;

  constructor(baseDir: string) {
    this.baseDir = baseDir;
  }

  /**
   * Scan the template directory using a glob pattern and load every *.hbs file
   * into the `rawTemplates` map. This method should be called once at
   * application startup.
   */
  async loadAllTemplates(): Promise<void> {
    // No-op: We now read from disk on every request to ensure zero cache issues
    console.log('[TemplateLoader] Caching DISABLED. Reading from disk on-demand.');
  }

  /** Retrieve the raw template string for a given absolute path by reading disk. */
  async getRawTemplate(filePath: string): Promise<string | undefined> {
    try {
      console.log("get raw template path: ", filePath)
      return await fs.readFile(filePath, 'utf-8');
    } catch (e) {
      console.error(`[TemplateLoader] Failed to read template: ${filePath}`, e);
      return undefined;
    }
  }

  /** Helper to find all template paths dynamically. */
  async listTemplatePaths(): Promise<string[]> {
    const pattern = path.join(this.baseDir, '**/*.hbs').replace(/\\/g, '/');
    return await fg(pattern, { dot: false, onlyFiles: true });
  }
}
