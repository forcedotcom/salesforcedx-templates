import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { noVerifyDenial } = require('../../scripts/ai-safeguards.js');

export const GitSafeguards = async () => ({
  'tool.execute.before': async (input, output) => {
    if (input.tool !== 'bash' && input.tool !== 'shell') return;
    const reason = noVerifyDenial(String(output.args.command ?? ''));
    if (reason) throw new Error(reason);
  },
});
