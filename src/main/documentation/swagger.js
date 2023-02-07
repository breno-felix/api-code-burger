const env = require('../config/envfile')

module.exports = {
  openapi: '3.0.0',
  info: {
    title: 'API Code Burguer',
    summary: 'A hamburger shop manager.',
    description:
      "This API aims to enable the routine of a hamburger restaurant's operation.",
    version: '1.0',
    termsOfService: `${env.appUrl}/terms`,
    contact: {
      name: 'Breno Felix',
      email: 'brenodev.felix@edu.unifor.br'
    }
  },
  tags: [{ name: 'User', description: 'Operations about user' }],
  servers: [
    {
      url: `${env.appUrl}/api`,
      description:
        process.env.NODE_ENV === 'production'
          ? 'API de produção'
          : 'API de teste'
    }
  ],
  paths: {
    '/sign-up': {
      post: {
        summary: 'Create user',
        description: 'Route to sign up a new user.',
        tags: ['User'],
        requestBody: {
          required: true,
          $ref: '#/components/requestBodies/UserSignUp'
        },
        responses: {
          201: {
            $ref: '#/components/responses/Created'
          },
          400: {
            $ref: '#/components/responses/BadRequest'
          },
          500: {
            $ref: '#/components/responses/ServerError'
          }
        }
      }
    }
  },
  components: {
    schemas: {
      User: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: "The user's name",
            required: true,
            example: 'Breno Felix'
          },
          email: {
            type: 'string',
            description: "The user's email, must be unique",
            required: true,
            example: 'brenodev.felix@gmail.com'
          },
          password: {
            type: 'string',
            description: "The user's password",
            required: true,
            example: 'password123'
          },
          admin: {
            type: 'boolean',
            description: "The user's type, default to false",
            default: false
          }
        },
        additionalProperties: false
      }
    },
    responses: {
      Created: {
        description: 'The user was successfully created',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  description: 'Success message',
                  default: 'The user was successfully created.'
                }
              }
            }
          }
        }
      },
      BadRequest: {
        description: 'Bad Request - Missing or Invalid Parameters',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                error: {
                  type: 'string',
                  description: 'Error message',
                  example: 'email must be unique in user database.'
                }
              }
            }
          }
        }
      },
      ServerError: {
        description: 'Internal Server Error',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                error: {
                  type: 'string',
                  description: 'Error message',
                  example: 'Internal error.'
                }
              }
            }
          }
        }
      }
    },
    requestBodies: {
      UserSignUp: {
        content: {
          'application/json': {
            schema: {
              allOf: [
                { $ref: '#/components/schemas/User' },
                {
                  type: 'object',
                  properties: {
                    repeatPassword: {
                      type: 'string',
                      description:
                        'It must be equal to password, entered by the user during registration, it is not stored.',
                      required: true,
                      example: 'password123'
                    }
                  }
                }
              ]
            }
          }
        },
        description:
          'User object needed to create a new user. RepeatPassword is mandatory and must be equal to password.',
        required: true
      }
    }
  }
}
