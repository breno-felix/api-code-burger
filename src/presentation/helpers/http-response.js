const { UnauthorizedError, ServerError } = require('../errors')
module.exports = class HttpResponse {
  static badRequest(error) {
    return {
      statusCode: 400,
      body: {
        error: error.message
      }
    }
  }

  static serverError() {
    return {
      statusCode: 500,
      body: {
        error: new ServerError().message
      }
    }
  }

  static unauthorizedError() {
    return {
      statusCode: 401,
      body: {
        error: new UnauthorizedError().message
      }
    }
  }

  static ok(data) {
    return {
      statusCode: 200,
      body: data
    }
  }

  static created(data) {
    return {
      statusCode: 201,
      body:
        data ||
        'The request was successful and a new resource was created as a result.'
    }
  }

  static noContent(data) {
    return {
      statusCode: 204,
      body:
        data ||
        'The request was successfully processed but is not returning any content.'
    }
  }
}
