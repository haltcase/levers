module.exports = {
  root: true,
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    node: true,
    mocha: true
  },
  extends: 'standard',
  plugins: ['prefer-let'],
  rules: {
    quotes: ['error', 'single', {
      avoidEscape: true,
      allowTemplateLiterals: true
    }],

    'prefer-let/prefer-let': 2
  }
}
