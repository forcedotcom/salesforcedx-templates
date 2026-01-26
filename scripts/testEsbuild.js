const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Run the command
exec('node ./scripts/esbuild.config.js', (error, stdout, stderr) => {
  // Combine stdout and stderr to check the entire output
  const output = `${stdout}\n${stderr}`;
  if (error) {
    console.error(stderr);
    process.exit(1); // Exit with an error code
  }
  // Check if the output contains the error string
  if (output.includes('[require-resolve-not-external]')) {
    console.error(
      'Error: A dependency that has to be externalized in esbuild process is found. Please resolve it!'
    );
    process.exit(1); // Exit with an error code
  }

  // Additionally, check the bundled output for problematic require.resolve patterns
  const bundlePath = path.join(process.cwd(), 'dist', 'index.js');
  if (!fs.existsSync(bundlePath)) {
    console.error('Error: dist/index.js not found after bundling');
    process.exit(1);
  }

  const bundledCode = fs.readFileSync(bundlePath, 'utf8');

  // Look for require.resolve calls to npm packages (not relative/absolute paths)
  // Pattern matches: require.resolve("package-name") or require.resolve("@scope/package/subpath")
  // Excludes: require.resolve("./relative") or require.resolve("../relative") or require.resolve("/absolute")
  const requireResolvePattern =
    /require\.resolve\s*\(\s*['"]((?!\.\/|\.\.\/|\/)[@\w\-\/\.]+)['"]\s*\)/g;

  const foundIssues = [];
  const lines = bundledCode.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const matches = [...line.matchAll(requireResolvePattern)];

    for (const match of matches) {
      const packageName = match[1];

      foundIssues.push({
        package: packageName,
        line: i + 1,
        code: line.trim(),
      });
    }
  }

  if (foundIssues.length > 0) {
    console.error(
      '\nError: Bundled code contains require.resolve() calls to npm packages!'
    );
    console.error(
      'These will fail at runtime when bundled in VSCode extension:\n'
    );
    foundIssues.forEach((issue) => {
      console.error(`  Line ${issue.line}: ${issue.package}`);
      console.error(`    ${issue.code}`);
    });
    console.error(
      '\nSolution: Either externalize these packages in esbuild.config.js'
    );
    console.error('or use local file paths instead of require.resolve().');
    process.exit(1);
  }

  process.exit(0); // Exit with success code
});
