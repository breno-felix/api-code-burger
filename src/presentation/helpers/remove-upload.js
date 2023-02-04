const fs = require('fs')
const path = require('path')
const env = require('../../main/config/envfile')
const aws = require('aws-sdk')

module.exports = class RemoveUpload {
  static async remove(key) {
    if (env.storageTypes === 's3') {
      new aws.S3()
        .deleteObject({
          Bucket: 'codeburger',
          Key: key
        })
        .promise()
    } else {
      await fs.unlink(
        path.resolve(__dirname, '..', '..', '..', 'uploads', key),
        () => {}
      )
    }
  }
}
