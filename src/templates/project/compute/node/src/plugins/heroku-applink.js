import fp from 'fastify-plugin';
import salesforceSdk from '@heroku/applink';

const customAsyncHandlers = {};

export default fp(async function (fastify, _opts) {
  /**
   * Salesforce PreHandler to enrich requests.
   *
   * Requests made from External Services contain additional context
   * about the request and invoking org.  Context is used to hydrated
   * Salesforce SDK APIs.
   */
  const salesforcePreHandler = async (request, _reply) => {
    request.sdk = salesforceSdk.init();

    const routeOptions = request.routeOptions;
    const hasSalesforceConfig =
      routeOptions.config && routeOptions.config.salesforce;
    if (
      !(
        hasSalesforceConfig &&
        routeOptions.config.salesforce.parseRequest === false
      )
    ) {
      // Enrich request with hydrated SDK APIs
      const parsedRequest = request.sdk.salesforce.parseRequest(
        request.headers,
        request.body,
        request.log
      );
      request.sdk = Object.assign(request.sdk, parsedRequest);
    }
  };

  /**
   * Handler for asynchronous APIs to respond to requests immediately and
   * then perform request handling asynchronously.  The API may respond to
   * the invoking org via External Service callback APIs as defined in the
   * operation's OpenAPI spec.
   *
   * @param request
   * @param reply
   * @returns {Promise<void>}
   */
  const asyncHandler = async (request, reply) => {
    request.log.info(
      `Async response for ${request.method} ${request.routeOptions.url}`
    );

    const customAsyncHandler = request.routeOptions.config.salesforce.async;
    if (typeof customAsyncHandler === 'function') {
      await customAsyncHandler(request, reply);
    } else {
      reply.code(201);
    }
  };

  /**
   * Apply Salesforce preHandlers to routes.
   *
   * {config: {salesforce: {parseRequest: false}}}
   * Parsing is specific to External Service requests that contain additional
   * request context.  Setting parseRequest:false will not parse the request
   * to hydrate Salesforce SDK APIs to request.sdk.  This is required for
   * requests NOT originating from Heroku External Services such as
   * Data Action Target requests.
   *
   * {config: {salesforce: {async: true || customResponseHandlerFunction}}},
   * When routes are as asynchronous, true applies a 201 response signalling
   * that the request was received.  Request handling is then done asynchronously.
   * To customize the response, provide a function.
   */
  fastify.addHook('onRoute', routeOptions => {
    const hasSalesforceConfig =
      routeOptions.config && routeOptions.config.salesforce;

    if (!routeOptions.preHandler) {
      routeOptions.preHandler = [salesforcePreHandler];
    } else if (Array.isArray(routeOptions.preHandler)) {
      routeOptions.preHandler.push(salesforcePreHandler);
    }

    if (hasSalesforceConfig && routeOptions.config.salesforce.async) {
      const customAsyncHandler = routeOptions.handler;
      routeOptions.handler = asyncHandler;
      customAsyncHandlers[`${routeOptions.method} ${routeOptions.routePath}`] =
        customAsyncHandler;
      fastify.addHook('onResponse', async (request, reply) => {
        const routeIdx = `${request.method} ${request.routeOptions.url}`;
        if (request.sdk && request.sdk.asyncComplete === true) {
          request.log.info(`${routeIdx} is async complete`);
          return;
        }

        const customAsyncHandler = customAsyncHandlers[`${routeIdx}`];
        if (customAsyncHandler) {
          request.log.info(`Found async handler for route index ${routeIdx}`);
          await customAsyncHandler(request, reply);
          request.sdk.asyncComplete = true;
          request.log.info(`Set async ${routeIdx} completes`);
        }
      });
    }
  });

  /**
   * Healthcheck endpoint.  Called by the Heroku AppLink Service Mesh to determine health of app.
   */
  fastify.get(
    '/healthcheck',
    { config: { salesforce: { parseRequest: false } } },
    async function (request, reply) {
      reply.status(200).send('OK');
    }
  );
});
