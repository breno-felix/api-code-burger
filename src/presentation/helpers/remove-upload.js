const fs = require('fs')
const path = require('path')
const env = require('../../main/config/envfile')
const { S3 } = require('@aws-sdk/client-s3')

module.exports = class RemoveUpload {
  static async remove(key) {
    if (env.storageTypes === 's3') {
      try {
        const s3 = new S3({
          region: env.awsDefaultRegion,
          credentials: {
            accessKeyId: env.awsAccessKeyId,
            secretAccessKey: env.awsSecretAccessKey
          }
        })

        await s3.deleteObject({
          Bucket: env.awsBucketName,
          Key: key
        })
      } catch (error) {
        console.error('Erro ao excluir objeto do S3:', error)
        throw error
      }
    } else {
      try {
        await fs.unlink(
          path.resolve(__dirname, '..', '..', '..', 'uploads', key),
          () => {}
        )
      } catch (error) {
        console.error('Erro ao excluir arquivo local:', error)
        throw error
      }
    }
  }
}
