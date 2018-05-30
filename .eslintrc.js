module.exports = {
  extends: [
    'airbnb-base'
  ],
  parser: 'babel-eslint',
  env: {
    es6: true
  },
  overrides: [{
    files: ['*.test.*'],
    env: {
      jest: true
    }
  }, {
    files: ['src/*'],
    env: {
      browser: true
    },
  }],
  rules: {
    'no-use-before-define': 'off',
  },
};
