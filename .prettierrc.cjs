module.exports = {
  printWidth: 100,
  singleQuote: true,
  overrides: [
    {
      files: ['*.scss', '*.css'],
      options: {
        requirePragma: false,
        parser: 'scss',
      },
    },
    {
      files: ['*.html', '*.hbs'],
      options: {
        requirePragma: false,
        parser: 'html',
        htmlWhitespaceSensitivity: 'ignore',
      },
    },
  ],
};
