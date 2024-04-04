module.exports = {
  parser: '@babel/eslint-parser',
  parserOptions: {
    requireConfigFile: false,
    babelOptions: {
      plugins: ['@babel/plugin-syntax-import-assertions'],
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: ['google', 'plugin:jsdoc/recommended', 'prettier'],
  overrides: [],
  plugins: ['prettier', 'jsdoc'],
  rules: {
    'require-jsdoc': 'off',
    'valid-jsdoc': 'off',
    'jsdoc/require-jsdoc': [
      'warn',
      {
        publicOnly: {
          ancestorsOnly: true,
          cjs: false,
          window: false,
        },
        require: {
          ArrowFunctionExpression: true,
          ClassDeclaration: true,
          FunctionDeclaration: true,
          FunctionExpression: true,
          MethodDefinition: true,
        },
      },
    ],
    'prettier/prettier': 'error',
    'arrow-body-style': 'off',
    'prefer-arrow-callback': 'off',
  },
  settings: {
    jsdoc: {
      mode: 'typescript',
    },
  },
};
