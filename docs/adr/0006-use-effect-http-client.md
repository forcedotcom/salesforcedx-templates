# Use Effect's HTTP client

Use Effect v4's `NodeHttpClient` Undici backend for outbound GitHub requests in `gitRepoUtils.ts` (WI 22), with `EnvHttpProxyAgent` supplied through its `Dispatcher` service to preserve proxy-environment behavior; avoid the Fetch/global-fetch backend.
