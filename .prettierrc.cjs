module.exports = {
  printWidth: 100,
  singleQuote: true,
  overrides: [
    {
      files: ["*.scss", "*.css"],
      options: {
        requirePragma: false,
        parser: "scss",
      },
    },
    {
      files: ["*.html"],
      options: {
        requirePragma: false,
        parser: "html",
        htmlWhitespaceSensitivity: "ignore",
      },
    },
  ],
};
