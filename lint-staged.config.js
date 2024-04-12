module.exports = {
  'src/**/*.{ts,cts,js,cjs}': [
    'prettier --write',
    'eslint --fix --cache --cache-location ./node_modules/.cache/.eslintcache',
    'git add'
  ]
};
