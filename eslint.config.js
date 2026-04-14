// ESLint config for Expo React Native project
module.exports = {
  extends: [
    'eslint:recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['react', 'react-hooks'],
  env: {
    node: true,
    es2020: true,
  },
  rules: {
    'react-hooks/rules-of-hooks': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
    'no-unused-vars': 'off',
    'no-undef': 'off',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  ignorePatterns: ['node_modules/', '.expo/', 'dist/'],
};
