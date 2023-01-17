module.exports = class ExpressRouterAdapter {
  static adapt(router) {
    return async (request, response) => {
      const httpRequest = {
        body: request.body
      }
      const httpResponse = await router.route(httpRequest)
      response.status(httpResponse.statusCode).json(httpResponse.body)
    }
  }
}
