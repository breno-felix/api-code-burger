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
  tags: [
    { name: 'User', description: 'Operations about user' },
    { name: 'Category', description: 'Operations about category' },
    { name: 'Product', description: 'Operations about product' },
    { name: 'Order', description: 'Operations about order' }
  ],
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
            description: 'Ok',
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
          'This endpoint creates a new category with the given name and file. Needed login with admin user',
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
    },
    '/update-category/{category_id}': {
      put: {
        security: [
          {
            bearerAuth: []
          }
        ],
        summary: 'Update a category',
        description:
          'This endpoint updates a category with the given name or file. Needed login with admin user',
        tags: ['Category'],
        parameters: [
          {
            name: 'category_id',
            in: 'path',
            description: 'ID of category to update',
            required: true,
            schema: {
              type: 'string',
              description: "The category's id, it must exist",
              required: true,
              example: '63e41caae48b4160afb18192'
            }
          }
        ],
        requestBody: {
          required: true,
          $ref: '#/components/requestBodies/UpdateCategory'
        },
        responses: {
          204: {
            $ref: '#/components/responses/NoContent'
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
    },
    '/index-category': {
      get: {
        security: [
          {
            bearerAuth: []
          }
        ],
        summary: 'Show all categories',
        description: 'This endpoint show all categories and needed login.',
        tags: ['Category'],
        responses: {
          200: {
            description: 'Ok',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    $ref: '#/components/schemas/Category'
                  }
                }
              }
            }
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
    '/new-product': {
      post: {
        security: [
          {
            bearerAuth: []
          }
        ],
        summary: 'Create a new product',
        description:
          'This endpoint creates a new product with the given name, price, category_id, offer and file. Needed login with admin user ',
        tags: ['Product'],
        requestBody: {
          required: true,
          $ref: '#/components/requestBodies/NewProduct'
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
    },
    '/update-product/{product_id}': {
      put: {
        security: [
          {
            bearerAuth: []
          }
        ],
        summary: 'Update a product',
        description:
          'This endpoint updates a product with the given name, price, category_id, offer or file. Needed login with admin user ',
        tags: ['Product'],
        parameters: [
          {
            name: 'product_id',
            in: 'path',
            description: 'ID of product to update',
            required: true,
            schema: {
              type: 'string',
              description: "The product's id, it must exist",
              required: true,
              example: '63e41caae48b4160afb18192'
            }
          }
        ],
        requestBody: {
          required: true,
          $ref: '#/components/requestBodies/UpdateProduct'
        },
        responses: {
          204: {
            $ref: '#/components/responses/NoContent'
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
    },
    '/index-product': {
      get: {
        security: [
          {
            bearerAuth: []
          }
        ],
        summary: 'Show all products',
        description: 'This endpoint show all products and needed login.',
        tags: ['Product'],
        responses: {
          200: {
            description: 'Ok',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    $ref: '#/components/schemas/Product'
                  }
                }
              }
            }
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
    '/new-order': {
      post: {
        summary: 'Create a new order',
        description:
          'This endpoint creates a new order with the given array of products with quantity. Needed login.',
        tags: ['Order'],
        parameters: [
          {
            name: 'Authorization',
            in: 'header',
            description: 'Bearer token including user_id',
            required: true,
            schema: {
              type: 'string',
              description: 'JWT Token for authenticated user',
              example:
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkJyZW5vIEZlbGl4IiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
            }
          }
        ],
        requestBody: {
          required: true,
          $ref: '#/components/requestBodies/NewOrder'
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
          500: {
            $ref: '#/components/responses/ServerError'
          }
        }
      }
    },
    '/index-order': {
      get: {
        security: [
          {
            bearerAuth: []
          }
        ],
        summary: 'Show all orders',
        description: 'This endpoint show all orders and needed login.',
        tags: ['Order'],
        responses: {
          200: {
            description: 'Ok',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    $ref: '#/components/schemas/Order'
                  }
                }
              }
            }
          },
          401: {
            $ref: '#/components/responses/Unauthorized'
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
      },
      Category: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: 'Automatically generated by Mongoose',
            required: true,
            example: '63e417f8369e2dab767e6ddc'
          },
          name: {
            type: 'string',
            description: "The category's name, must be unique",
            required: true,
            example: 'Petiscos'
          },
          imagePath: {
            type: 'string',
            description: "The category's image path",
            required: true,
            example: '1675892727882_petiscos.png'
          },
          urlPath: {
            type: 'string',
            description: "The category's image url, it's a virtual field",
            required: true,
            example: 'http://localhost:3001/file/1675892727882_petiscos.png'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            required: true,
            description: 'Automatically generated by Mongoose',
            example: '2023-02-08T21:45:28.016Z'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            required: true,
            description: 'Automatically generated by Mongoose',
            example: '2023-02-08T21:45:28.016Z'
          }
        },
        additionalProperties: false
      },
      Product: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: 'Automatically generated by Mongoose',
            required: true,
            example: '63e417f8369e2dab767e6ddc'
          },
          name: {
            type: 'string',
            description: "The product's name",
            required: true,
            example: 'Batata Frita'
          },
          price: {
            type: 'number',
            description: "The product's price",
            required: true,
            minimum: 0,
            example: 10.5
          },
          category_id: {
            type: 'string',
            description: "The product's category, it must exist",
            required: true,
            example: '63e41caae48b4160afb18192'
          },
          imagePath: {
            type: 'string',
            description: "The product's image path",
            required: true,
            example: '1675893930221_batata-frita-test.png'
          },
          offer: {
            type: 'boolean',
            description: "The product's offer, default to false",
            required: false,
            example: true
          },
          urlPath: {
            type: 'string',
            description: "The product's image url, it's a virtual field",
            required: true,
            example:
              'http://localhost:3001/file/1675893930221_batata-frita-test.png'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            required: true,
            description: 'Automatically generated by Mongoose',
            example: '2023-02-08T21:45:28.016Z'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            required: true,
            description: 'Automatically generated by Mongoose',
            example: '2023-02-08T21:45:28.016Z'
          }
        },
        additionalProperties: false
      },
      Order: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: 'Automatically generated by Mongoose',
            required: true,
            example: '63e417f8369e2dab767e6ddc'
          },
          user_id: {
            type: 'string',
            description: "The order's user, it must exist",
            required: true,
            example: '63e41caae48b4160afb18192'
          },
          products: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                product_id: {
                  type: 'string',
                  description: "Some order's product, it must exist",
                  required: true,
                  example: '63e41caae48b4160afb18192'
                },
                quantity: {
                  type: 'integer',
                  description: "The product's quantity",
                  required: true,
                  minimum: 1,
                  example: 2
                },
                _id: {
                  type: 'string',
                  description: 'Automatically generated by Mongoose',
                  required: true,
                  example: '63e417f8369e2dab767e6ddc'
                }
              }
            }
          },
          status: {
            type: 'string',
            description: "The order's status",
            required: true,
            example: 'Pedido realizado'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            required: true,
            description: 'Automatically generated by Mongoose',
            example: '2023-02-08T21:45:28.016Z'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            required: true,
            description: 'Automatically generated by Mongoose',
            example: '2023-02-08T21:45:28.016Z'
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
      NoContent: {
        description: 'NoContent',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  description: 'Success message',
                  default:
                    'The request was successfully processed but is not returning any content.'
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
      },
      NewProduct: {
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: "The product's name",
                  required: true,
                  example: 'Batata Frita'
                },
                price: {
                  type: 'number',
                  description: "The product's price",
                  required: true,
                  minimum: 0,
                  example: 10.5
                },
                category_id: {
                  type: 'string',
                  description: "The product's category, it must exist",
                  required: true,
                  example: '63e41caae48b4160afb18192'
                },
                offer: {
                  type: 'boolean',
                  description: "The product's offer, default to false",
                  required: false,
                  example: true
                },
                file: {
                  type: 'string',
                  description: "The product's image (jpeg, pjpeg, png, gif)",
                  required: true,
                  format: 'binary'
                }
              }
            }
          }
        },
        description: 'Product object needed to create a new product.',
        required: true
      },
      NewOrder: {
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  product_id: {
                    type: 'string',
                    description: "Some order's product, it must exist",
                    required: true,
                    example: '63e41caae48b4160afb18192'
                  },
                  quantity: {
                    type: 'integer',
                    description: "The product's quantity",
                    required: true,
                    minimum: 1,
                    example: 2
                  }
                }
              }
            }
          }
        },
        description: 'Products array needed to create a new order.',
        required: true
      },
      UpdateCategory: {
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: "The category's name, it must be unique",
                  example: 'Petiscos'
                },
                file: {
                  type: 'string',
                  description: "The category's image (jpeg, pjpeg, png, gif)",
                  format: 'binary'
                }
              }
            }
          }
        },
        description: 'Category object needed to update a category.',
        required: true
      },
      UpdateProduct: {
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: "The product's name",
                  example: 'Batata Frita'
                },
                price: {
                  type: 'number',
                  description: "The product's price",
                  minimum: 0,
                  example: 10.5
                },
                category_id: {
                  type: 'string',
                  description: "The product's category, it must exist",
                  example: '63e41caae48b4160afb18192'
                },
                offer: {
                  type: 'boolean',
                  description: "The product's offer, default to false",
                  example: true
                },
                file: {
                  type: 'string',
                  description: "The product's image (jpeg, pjpeg, png, gif)",
                  format: 'binary'
                }
              }
            }
          }
        },
        description: 'Product object needed to update a product.',
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
