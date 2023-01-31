const UserModel = require('../../infra/entities/UserModel')

module.exports = async (request, response, next) => {
  const { admin: isAdmin } = await UserModel.findById(request.userId)

  if (!isAdmin) {
    return response
      .status(403)
      .json({ error: 'Access denied you do not have permission to access' })
  }

  return next()
}
