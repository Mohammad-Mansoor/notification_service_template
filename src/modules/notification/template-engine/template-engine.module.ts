import { Module, Global } from '@nestjs/common';
import { TemplateEngine } from './template.engine';
import * as path from 'path';

@Global()
@Module({
  providers: [
    {
      provide: TemplateEngine,
      useFactory: async () => {
        // Path mapped to src/modules/notification/templates
        const templatesPath = path.join(process.cwd(), 'src', 'modules', 'notification', 'templates');
        const engine = new TemplateEngine(templatesPath);
        await engine.init(); // Caching is disabled; this ensures paths are valid
        return engine;
      },
    },
  ],
  exports: [TemplateEngine],
})
export class TemplateEngineModule {}
