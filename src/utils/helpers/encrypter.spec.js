jest.mock('bcrypt', () => ({
  isValid: true,
  valueHashed: 'hashed_value',
  async compare(value, hashed) {
    this.value = value
    this.hashed = hashed
    return this.isValid
  },
  async hash(value) {
    this.value = value
    return this.valueHashed
  }
}))

const bcrypt = require('bcrypt')
const Encrypter = require('./encrypter')
const { MissingParamServerError } = require('../errors')

const makeSut = () => {
  return new Encrypter(10)
}

describe('Encrypter', () => {
  test('Should call bcrypt.compare with correct values', async () => {
    const sut = makeSut()
    await sut.compare('any_value', 'hashed_value')
    expect(bcrypt.value).toBe('any_value')
    expect(bcrypt.hashed).toBe('hashed_value')
  })

  test('Should return true if bcrypt.compare returns true', async () => {
    const sut = makeSut()
    const isValid = await sut.compare('any_value', 'hashed_value')
    expect(isValid).toBe(true)
  })

  test('Should return false if bcrypt.compare returns false', async () => {
    const sut = makeSut()
    bcrypt.isValid = false
    const isValid = await sut.compare('any_value', 'hashed_value')
    expect(isValid).toBe(false)
  })

  test('Should throw if no params are provided to encrypter.compare', async () => {
    const sut = makeSut()
    expect(sut.compare()).rejects.toThrow(new MissingParamServerError('value'))
    expect(sut.compare('any_value')).rejects.toThrow(
      new MissingParamServerError('hash')
    )
  })

  test('Should call bcrypt.hash with correct value', async () => {
    const sut = makeSut()
    await sut.hash('any_value')
    expect(bcrypt.value).toBe('any_value')
  })

  test('Should return hash if bcrypt.hash returns hash', async () => {
    const sut = makeSut()
    const hash = await sut.hash('any_value')
    expect(hash).toBe(bcrypt.valueHashed)
  })

  test('Should throw if no value is provided to encrypter.hash', async () => {
    const sut = makeSut()
    expect(sut.hash()).rejects.toThrow(new MissingParamServerError('value'))
  })

  test('Should throw if no saltRounds is provided', async () => {
    const sut = new Encrypter()
    expect(sut.hash('any_value')).rejects.toThrow(
      new MissingParamServerError('saltRounds')
    )
  })
})
