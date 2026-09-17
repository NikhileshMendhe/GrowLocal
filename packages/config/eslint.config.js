export default {
  env: { browser: true, es2022: true, node: true },
  rules: {
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-empty': ['error', { allowEmptyCatch: false }],
  },
};
