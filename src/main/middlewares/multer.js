const multerConfig = require('../config/multerConfig')
const multer = require('multer')
const upload = multer(multerConfig).single('file')

module.exports = (request, response, next) => {
  try {
    upload(request, response, function (err) {
      if (err) {
        return response.status(400).json({
          error:
            'A error occurred when uploading. Errors of this type can occur due to sending files that are invalid due to format or size.'
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
