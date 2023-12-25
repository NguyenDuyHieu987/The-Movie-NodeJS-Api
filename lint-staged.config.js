module.exports = {
  'src/**/*.{ts,js,cjs}': [
    'prettier --write',
    'eslint --fix --cache',
    'git add'
  ]
};
