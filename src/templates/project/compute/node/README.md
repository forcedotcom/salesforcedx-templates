# <%- appname %>

Compute app scaffolded by `sf template generate project --template compute --compute-language node`,
built on the Heroku AppLink Node.js starter (Fastify).

## Endpoints

- `GET /api-docs` -- interactive Swagger UI generated from `api-spec.yaml`.
- `GET /healthcheck` -- used by the AppLink Service Mesh to check app health.

Add your own routes in `src/routes/index.js` (see the commented example
there), and a matching operation in `api-spec.yaml` for each one that should
be published as an External Service.

## Local development

```
npm install
npm run dev
```

## Deploy

```
sf plugins install @salesforce/plugin-deploy-retrieve@compute
sf project deploy start --metadata ComputeApp:<%- appname %> --target-org <org>
```
