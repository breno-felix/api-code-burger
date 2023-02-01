const HttpResponse = require('../../helpers/http-response')
const {
  InvalidParamError,
  CategoryNotCreatedError,
  ProductNotCreatedError
} = require('../../../utils/errors')
const fs = require('fs')
const path = require('path')
const env = require('../../../main/config/envfile')
const aws = require('aws-sdk')

const removeUpload = async (key) => {
  if (env.storageTypes === 's3') {
    new aws.S3()
      .deleteObject({
        Bucket: 'codeburger',
        Key: key
      })
      .promise()
  } else {
    await fs.unlink(
      path.resolve(__dirname, '..', '..', '..', '..', 'uploads', key),
      () => {}
    )
  }
}

module.exports = class UpdateProductRouter {
  constructor({ objectShapeValidator, updateProductUseCase } = {}) {
    this.objectShapeValidator = objectShapeValidator
    this.updateProductUseCase = updateProductUseCase
  }

  async route(httpRequest) {
    try {
      await this.objectShapeValidator.isValid(httpRequest.body)
      const { name, price, category_id, offer } = httpRequest.body
      let imagePath
      if (httpRequest.file) {
        imagePath = httpRequest.file.key
      }
      const { product_id } = httpRequest.params
      await this.updateProductUseCase.update({
        name,
        price,
        category_id,
        offer,
        imagePath,
        product_id
      })
      return HttpResponse.noContent()
    } catch (error) {
      if (httpRequest && httpRequest.file && httpRequest.file.key) {
        removeUpload(httpRequest.file.key)
      }
      if (error instanceof CategoryNotCreatedError) {
        return HttpResponse.badRequest(new CategoryNotCreatedError())
      } else if (error instanceof ProductNotCreatedError) {
        return HttpResponse.badRequest(new ProductNotCreatedError())
      } else if (error instanceof InvalidParamError) {
        return HttpResponse.badRequest(error)
      }
      return HttpResponse.serverError()
    }
  }
}
