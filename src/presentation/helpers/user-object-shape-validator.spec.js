const yup = require('yup')
const { InvalidParamError, MissingParamError } = require('../../utils/errors')

const makeSut = () => {
  const sut = new UserObjectShapeValidator()

  return {
    sut
  }
}

const schema = yup.object().shape({
  name: yup.string().required(),
  email: yup.string().email().required(),
  password: yup.string().required().min(6),
  repeatPassword: yup.ref('password'),
  admin: yup.boolean()
})

class UserObjectShapeValidator {
  async isValid(httpRequest) {
    try {
      if (!httpRequest) {
        throw new MissingParamError('httpRequest')
      }
      await schema.validateSync(httpRequest.body)
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        throw new InvalidParamError(error.errors)
      }
      throw error
    }
  }
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
    const { sut } = makeSut()

    const validateSyncSpy = jest.spyOn(schema, 'validateSync')

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
    const { sut } = makeSut()

    jest.spyOn(schema, 'validateSync').mockImplementationOnce(() => {
      throw new yup.ValidationError()
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
    const { sut } = makeSut()

    jest.spyOn(schema, 'validateSync').mockImplementationOnce(() => {
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
