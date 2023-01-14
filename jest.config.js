module.exports = {
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    '**/src/**/*.js',
    '!**/src/main/**',
    '!**/src/infra/helpers/mongo-helper.js'
  ],
  preset: '@shelf/jest-mongodb'
}
