jest.mock('jsonwebtoken', () => ({
  token: 'any_token',
  sign({ id }, secret, { expiresIn }) {
    this.id = id
    this.secret = secret
    this.expiresIn = expiresIn
    return this.token
  }
}))

const jwt = require('jsonwebtoken')
const { MissingParamServerError } = require('../errors')
const TokenGenerator = require('./token-generator')

const makeSut = () => {
  return new TokenGenerator({ secret: 'secret', expiresIn: '5d' })
}

describe('Token Generator', () => {
  test('Should return null if JWT return null', async () => {
    const sut = makeSut()
    jwt.token = null
    const token = await sut.generate('any_id')
    expect(token).toBeNull()
  })

  test('Should return a token if JWT returns token', async () => {
    const sut = makeSut()
    const token = await sut.generate('any_id')
    expect(token).toBe(jwt.token)
  })

  test('Should call JWT with correct values', async () => {
    const sut = makeSut()
    await sut.generate('any_id')
    expect(jwt.id).toBe('any_id')
    expect(jwt.secret).toBe(sut.secret)
    expect(jwt.expiresIn).toBe(sut.expiresIn)
  })

  test('Should throw if no secret is provided', async () => {
    const sut = new TokenGenerator()
    const promise = sut.generate('any_id')
    expect(promise).rejects.toThrow(new MissingParamServerError('secret'))
  })

  test('Should throw if no id is provided', async () => {
    const sut = makeSut()
    const promise = sut.generate()
    expect(promise).rejects.toThrow(new MissingParamServerError('id'))
  })
})
