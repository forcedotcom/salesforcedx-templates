# <%- appname %>

Compute app scaffolded by `sf template generate project --template compute --compute-language python`,
built on the Heroku AppLink Python starter (FastAPI).

## Endpoints

- `GET /` -- public welcome endpoint.
- `GET /health` -- public health check endpoint.
- `GET /docs` -- interactive Swagger UI generated from `api-spec.yaml`.

Add your own routers (for example in a new `app/routers/` package) and mount them on `sf_app` in
`app/main.py` (see the commented example there) for any endpoint that needs
Salesforce context, or on `app` directly for a public webhook. Add a
matching operation in `api-spec.yaml` for each one that should be published
as an External Service.

## Local development

```
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Deploy

```
sf plugins install @salesforce/plugin-deploy-retrieve@compute
sf project deploy start --metadata ComputeApp:<%- appname %> --target-org <org>
```
