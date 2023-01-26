const HttpResponse = require('../helpers/http-response')
const { MissingParamError, InvalidParamError } = require('../../utils/errors')
const fs = require('fs')
const path = require('path')
const env = require('../../main/config/envfile')
const aws = require('aws-sdk')

const s3 = new aws.S3()

module.exports = class NewProductRouter {
  constructor({ objectShapeValidator, createProductRepository } = {}) {
    this.objectShapeValidator = objectShapeValidator
    this.createProductRepository = createProductRepository
  }

  async route(httpRequest) {
    try {
      const requiredParamsBody = ['name', 'price', 'category_id']
      requiredParamsBody.forEach((param) => {
        if (!httpRequest.body[param]) {
          throw new MissingParamError(param)
        }
      })
      const requiredParamsFile = ['key']
      requiredParamsFile.forEach((param) => {
        if (!httpRequest.file || !httpRequest.file[param]) {
          throw new MissingParamError(param)
        }
      })
      await this.objectShapeValidator.isValid(httpRequest.body)
      const { name, price, category_id } = httpRequest.body
      const { key: imagePath } = httpRequest.file
      await this.createProductRepository.create({
        name,
        price,
        category_id,
        imagePath
      })
      return HttpResponse.created()
    } catch (error) {
      if (httpRequest && httpRequest.file && httpRequest.file.key) {
        if (env.storageTypes === 's3') {
          s3.deleteObject({
            Bucket: 'codeburger',
            Key: httpRequest.file.key
          }).promise()
        } else {
          await fs.unlink(
            path.resolve(
              __dirname,
              '..',
              '..',
              '..',
              'uploads',
              httpRequest.file.key
            ),
            () => {}
          )
        }
      }
      if (error instanceof InvalidParamError) {
        return HttpResponse.badRequest(error)
      } else if (error instanceof MissingParamError) {
        return HttpResponse.badRequest(error)
      }
      return HttpResponse.serverError()
    }
  }
}
