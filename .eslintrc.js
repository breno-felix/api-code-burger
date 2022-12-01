module.exports = {
  env: {
    es2021: true,
    node: true,
    'jest/globals': true
  },
  extends: ['standard', 'prettier'],
  plugins: ['prettier', 'jest'],
  overrides: [],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    camelcase: 'off',
    'prettier/prettier': 'error'
  }
}
