import { test } from 'tap';
import { build } from '../helper.js';

// Smoke test so `npm test` has something to run; add tests for your own routes alongside it.
test('GET /healthcheck responds OK', async t => {
  const app = await build(t);

  const response = await app.inject({ method: 'GET', url: '/healthcheck' });

  t.equal(response.statusCode, 200);
  t.equal(response.payload, 'OK');
});
