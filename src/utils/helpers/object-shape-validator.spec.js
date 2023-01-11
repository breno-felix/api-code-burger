const ObjectShapeValidator = require('./object-shape-validator')
const { ValidationError } = require('yup')
const { InvalidParamError, MissingParamError } = require('../../utils/errors')

const makeSut = () => {
  const yupSchemaSpy = makeYupSchema()

  const sut = new ObjectShapeValidator({
    yupSchema: yupSchemaSpy
  })

  return {
    sut,
    yupSchemaSpy
  }
}

const makeYupSchema = () => {
  class YupSchemaSpy {
    async validateSync(httpRequest) {
      this.httpRequest = httpRequest
    }
  }
  return new YupSchemaSpy()
}

describe('User Object Shape Validator', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('Should throw new MissingParamError if no httpRequest is provided', async () => {
    const { sut } = makeSut()
    expect(sut.isValid()).rejects.toThrow(new MissingParamError('httpRequest'))
  })

  test('Should call yup with correct httpRequest.body', async () => {
    const { sut, yupSchemaSpy } = makeSut()

    const validateSyncSpy = jest.spyOn(yupSchemaSpy, 'validateSync')

    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'any_email@mail.com',
        password: 'any_password',
        repeatPassword: 'any_password',
        admin: false
      }
    }
    await sut.isValid(httpRequest)
    expect(validateSyncSpy).toHaveBeenCalledWith(httpRequest.body)
  })

  test('Should throw new InvalidParamError if yup throw new yup.ValidationError', async () => {
    const { sut, yupSchemaSpy } = makeSut()

    jest.spyOn(yupSchemaSpy, 'validateSync').mockImplementationOnce(() => {
      throw new ValidationError()
    })

    const httpRequest = {
      body: {
        name: 'invalid_name',
        email: 'invalid_email@mail.com',
        password: 'invalid_password',
        repeatPassword: 'invalid_password',
        admin: false
      }
    }
    await expect(sut.isValid(httpRequest)).rejects.toThrow(
      new InvalidParamError('')
    )
  })

  test('Should throw new Error if yup throw new Error', async () => {
    const { sut, yupSchemaSpy } = makeSut()

    jest.spyOn(yupSchemaSpy, 'validateSync').mockImplementationOnce(() => {
      throw new Error()
    })

    const httpRequest = {
      body: {
        name: 'valid_name',
        email: 'valid_email@mail.com',
        password: 'valid_password',
        repeatPassword: 'valid_password',
        admin: false
      }
    }
    await expect(sut.isValid(httpRequest)).rejects.toThrow(new Error())
  })
})
