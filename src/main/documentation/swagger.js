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
    },
    '/login': {
      post: {
        summary: 'Sign in user',
        description: 'Performs user authentication and returns access token',
        tags: ['User'],
        requestBody: {
          required: true,
          $ref: '#/components/requestBodies/UserLogin'
        },
        responses: {
          200: {
            $ref: '#/components/responses/Success'
          },
          400: {
            $ref: '#/components/responses/BadRequest'
          },
          401: {
            $ref: '#/components/responses/Unauthorized'
          },
          500: {
            $ref: '#/components/responses/ServerError'
          }
        }
      }
    },
    '/new-category': {
      post: {
        security: [
          {
            bearerAuth: []
          }
        ],
        summary: 'Create a new category',
        description:
          'This endpoint creates a new category with the given name and file.',
        tags: ['Category'],
        requestBody: {
          required: true,
          $ref: '#/components/requestBodies/NewCategory'
        },
        responses: {
          201: {
            $ref: '#/components/responses/Created'
          },
          400: {
            $ref: '#/components/responses/BadRequest'
          },
          401: {
            $ref: '#/components/responses/Unauthorized'
          },
          403: {
            $ref: '#/components/responses/Forbidden'
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
        description: 'Created',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  description: 'Success message',
                  default:
                    'The request was successful and a new resource was created as a result.'
                }
              }
            }
          }
        }
      },
      Success: {
        description: 'The user was successfully signed in',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                token: {
                  type: 'string',
                  description: 'JWT Token for authenticated user',
                  example:
                    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkJyZW5vIEZlbGl4IiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
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
                  example: 'Missing param: paramName'
                }
              }
            }
          }
        }
      },
      Unauthorized: {
        description: 'Unauthorized - Incorrect credentials',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                error: {
                  type: 'string',
                  description: 'Error message',
                  example: 'Unauthorized'
                }
              }
            }
          }
        }
      },
      Forbidden: {
        description: 'Forbidden',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                error: {
                  type: 'string',
                  description: 'Error message',
                  example: 'Access denied you do not have permission to access'
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
      },
      UserLogin: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                email: {
                  type: 'string',
                  description: "The user's email",
                  required: true,
                  example: 'brenodev.felix@gmail.com'
                },
                password: {
                  type: 'string',
                  description: "The user's password",
                  required: true,
                  example: 'password123'
                }
              },
              additionalProperties: false
            }
          }
        },
        description: 'User object needed to sign in a existing user.',
        required: true
      },
      NewCategory: {
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: "The category's name, it must be unique",
                  required: true,
                  example: 'Petiscos'
                },
                file: {
                  type: 'string',
                  description: "The category's image (jpeg, pjpeg, png, gif)",
                  required: true,
                  format: 'binary'
                }
              }
            }
          }
        },
        description: 'Category object needed to create a new category.',
        required: true
      }
    },
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  }
}
