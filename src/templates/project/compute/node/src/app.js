import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import AutoLoad from '@fastify/autoload';
import Swagger from '@fastify/swagger';
import SwaggerUI from '@fastify/swagger-ui';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Pass --options via CLI arguments in command to enable these options.
const options = {
  // Configure log's requestId to use custom header
  requestIdHeader: 'x-request-id',
};

export default async function (fastify, opts) {
  // Place here your custom code!
  fastify.register(Swagger, {
    mode: 'static',
    specification: {
      path: './api-spec.yaml',
    },
    exposeRoute: true,
  });

  fastify.register(SwaggerUI, {
    routePrefix: '/api-docs',
  });

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  fastify.register(AutoLoad, {
    dir: join(__dirname, 'plugins'),
    options: Object.assign({}, opts),
  });

  // This loads all plugins defined in routes
  // define your routes in one of these
  fastify.register(AutoLoad, {
    dir: join(__dirname, 'routes'),
    options: Object.assign({}, opts),
  });
}

export { options };
