const { build } = require('esbuild');
const { exec } = require('child_process');
const { Generator } = require('npm-dts');
new Generator({
  output: `dist/src/index.d.ts`,
}).generate();

const sharedConfig = {
  bundle: true,
  format: 'cjs',
  platform: 'node',
  external: [],
  minify: false,
  keepNames: true,
  plugins: [],
};

(async () => {
  await build({
    ...sharedConfig,
    entryPoints: ['./lib/index.js'],
    outdir: 'dist/src',
  });
})()
  .then(() => {
    exec(
      'node ./scripts/build-templates.js --esbuild',
      (error, stdout, stderr) => {
        if (error) {
          console.error(`Error executing command: ${error}`);
          return;
        }
        if (stderr) {
          console.error(`Error output: ${stderr}`);
          return;
        }
        console.log(`Output: ${stdout}`);
      }
    );
  })
  .catch(() => process.exit(1));
