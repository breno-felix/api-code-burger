const multerConfig = require('../config/multerConfig')
const multer = require('multer')
const upload = multer(multerConfig).single('file')

module.exports = (request, response, next) => {
  try {
    upload(request, response, function (err) {
      if (err) {
        return response.status(400).json({
          error: err
        })
      }
      return next()
    })
  } catch (error) {
    return response
      .status(500)
      .json({ error: 'An unknown error occurred when uploading.' })
  }
}
