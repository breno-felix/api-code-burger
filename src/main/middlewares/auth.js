const jwt = require('jsonwebtoken')
const env = require('../config/envfile')

module.exports = (request, response, next) => {
  const authToken = request.headers.authorization

  if (!authToken) {
    return response.status(401).json({ error: 'Token not provided' })
  }

  const token = authToken.split(' ')[1]

  try {
    jwt.verify(token, env.secret, function (error, decoded) {
      if (error) {
        throw new Error()
      }

      request.userId = decoded.id
      request.userName = decoded.name

      return next()
    })
  } catch (error) {
    return response.status(401).json({ error: 'Token is invalid' })
  }
}
