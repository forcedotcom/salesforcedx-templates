export default async function (fastify, _opts) {
  // Add your routes here. Every route registered this way automatically gets
  // the Salesforce preHandler from ../plugins/heroku-applink.js, which
  // decodes the invoking org's context onto request.sdk. For example:
  //
  // fastify.get('/hello', async function (request, _reply) {
  //   const { context, logger } = request.sdk;
  //   const org = context.org;
  //
  //   logger.info(`GET /hello for org ${org.id}`);
  //   const result = await org.dataApi.query('SELECT Id, Name FROM Account LIMIT 1');
  //   return result.records.map((rec) => rec.fields);
  // });
}
