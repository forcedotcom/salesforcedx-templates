module.exports = {
  'src/templates/**/*.*?(x)': filenames =>
    filenames.map(filename => `chmod 664 '${filename}'`),
  '**/*.{js,json,md}?(x)': () => 'npm run reformat'
};
