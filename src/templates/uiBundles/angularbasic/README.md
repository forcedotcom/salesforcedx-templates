# Angular UI Bundle

A Salesforce UI Bundle built with Angular 19, Vite 7, and Tailwind CSS v4.

## Getting Started

### Install dependencies

```bash
npm i
```

### Local development

```bash
npm run dev
```

### Build for deployment

```bash
npm run build
```

### Deploy to Salesforce

```bash
sf project deploy start --source-dir force-app/main/default/uiBundles --target-org <your-org-alias>
```

## Project Structure

```
src/
├── main.ts                    # App bootstrap
├── styles/global.css          # Tailwind CSS
├── app/
│   ├── app.component.ts       # Root component
│   ├── app.config.ts          # App config + APP_BASE_HREF wiring
│   └── app.routes.ts          # Client-side routes
├── pages/
│   ├── home/                  # Home page
│   └── not-found/             # 404 page
└── api/
    └── graphql-client.ts      # GraphQL helper via @salesforce/sdk-data
```

## Key Dependencies

| Package | Purpose |
|---------|---------|
| `@angular/*` | Angular framework |
| `@analogjs/vite-plugin-angular` | Angular + Vite integration |
| `@salesforce/vite-plugin-ui-bundle` | Salesforce proxy + SFDC_ENV injection |
| `tailwindcss` | Utility-first CSS |
| `@salesforce/sdk-data` | Salesforce GraphQL/data access |
