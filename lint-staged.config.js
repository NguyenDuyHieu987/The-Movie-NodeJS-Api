module.exports = {
  'src/**/*.{ts,cts,js,cjs}': [
    'prettier --write',
    'eslint --fix --cache',
    'git add'
  ]
};
