const multerConfig = require('../config/multerConfig')
const multer = require('multer')

module.exports = multer(multerConfig)
