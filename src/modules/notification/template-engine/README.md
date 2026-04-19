# Template Engine Guide

## Overview
The **Template Engine** layer lives in `src/modules/notification/template-engine/` and provides a clean, high‑performance way to render email templates using Handlebars.

### Core Components
| File | Responsibility |
|------|-----------------|
| `template.types.ts` | Strongly‑typed enums and DTOs (`TemplateEventType`, `TemplateRenderInput`, `TemplateOutput`). |
| `template.cache.ts` | In‑memory cache for compiled Handlebars functions. |
| `template.loader.ts` | Scans `src/modules/notification/templates/**\*.hbs` at startup and stores raw file contents. |
| `template.renderer.ts` | Registers partials/layouts, compiles templates (with caching) and renders them. |
| `template.registry.resolver.ts` | Central mapping from `TemplateEventType` → absolute paths of **HTML** and **subject** Handlebars files. |
| `template.engine.ts` | Public façade used by the Notification service – orchestrates loading, registry lookup, rendering and returns `{ subject, html }`. |

## Bootstrapping
Add the engine as a provider in a NestJS module (e.g. `NotificationModule`).
```ts
import { Module, OnModuleInit } from '@nestjs/common';
import { TemplateEngine } from './template-engine/template.engine';

@Module({
  providers: [TemplateEngine],
  exports: [TemplateEngine],
})
export class NotificationModule implements OnModuleInit {
  constructor(private readonly engine: TemplateEngine) {}

  async onModuleInit() {
    // Load all .hbs files once – this populates the cache.
    await this.engine.init();
  }
}
```

## Rendering an Email
```ts
import { TemplateEngine, TemplateEventType } from './template-engine';

// Example payload for an OTP email
const payload = { otp: '123456', userName: 'John Doe' };

const result = await this.engine.render(
  TemplateEventType.OTP,
  payload,
);

// result.subject -> string, result.html -> string (ready for your mailer)
```

### Using the generic helper
If you already have a `TemplateRenderInput` object you can call:
```ts
await this.engine.renderFromInput({ type: TemplateEventType.PASSWORD_RESET, data: {...} });
```

## Adding a New Email Template
1. **Create Handlebars files** under `src/modules/notification/templates/email/<domain>/<template>/`:
   - `*.html.hbs` – full HTML body (you can use `{{> layout}}` etc.).
   - `*.subject.hbs` – plain‑text subject line.
   - (Optional) `partials/` or `layouts/` sub‑folders for reusable pieces.
2. **Add placeholders** using `{{variable}}` that match the keys you will pass in the payload.
3. **Extend `TemplateEventType`** in `template.types.ts` with a new enum value.
4. **Update `TemplateRegistryResolver`** – add a `case` that returns the absolute paths for the new HTML and subject files.
5. **Re‑run the application** – the loader will automatically pick up the new files on startup.

## Cache Behaviour
- The first time a template is rendered, it is compiled and stored in `TemplateCache`.
- Subsequent renders fetch the compiled function from the cache – no filesystem I/O.
- In development you can clear the cache by calling `engine.loader.cache.clear()` (or simply restart the app).

## Folder Structure Recap
```
src/modules/notification/
├─ templates/
│  └─ email/
│     ├─ auth/
│     │  ├─ otp/
│     │  │   ├─ otp.html.hbs
│     │  │   └─ otp.subject.hbs
│     │  ├─ password-reset/
│     │  │   ├─ password-reset.html.hbs
│     │  │   └─ password-reset.subject.hbs
│     │  ├─ user-creation/
│     │  │   ├─ user-creation.html.hbs
│     │  │   └─ user-creation.subject.hbs
│     │  ├─ password-reset-request/
│     │  │   ├─ password-reset-request.html.hbs
│     │  │   └─ password-reset-request.subject.hbs
│     │  └─ new-device-detected/
│     │      ├─ new-device-detected.html.hbs
│     │      └─ new-device-detected.subject.hbs
│     └─ ... (other domains like healthcare, billing)
├─ template-engine/
│  ├─ template.types.ts
│  ├─ template.cache.ts
│  ├─ template.loader.ts
│  ├─ template.renderer.ts
│  ├─ template.registry.resolver.ts
│  └─ template.engine.ts
└─ notification.module.ts
```

---
### TL;DR
1. **Bootstrap** – call `engine.init()` on app start.
2. **Render** – `engine.render(eventType, payload)`.
3. **Extend** – add files, enum entry, and registry case.
4. **Cache** – automatic, clear with `engine.loader.cache.clear()`.

Happy templating! 🎉
