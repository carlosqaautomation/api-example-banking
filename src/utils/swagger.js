const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'BankAPI - API Bancaria de Ejemplo',
      version: '1.0.0',
      description: `API Bancaria para pruebas de automatización con Karate DSL.

## Características
- Autenticación JWT con refresh tokens
- Gestión de cuentas bancarias
- Transferencias entre cuentas
- Gestión de beneficiarios
- Depósitos y pagos de servicios
- Tarjetas virtuales
- Validación de schemas`,
      contact: { name: 'QA Team' }
    },
    servers: [{ url: 'http://localhost:3000', description: 'Development server' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
      },
      schemas: {
        User: { type: 'object', properties: { id: { type: 'string', format: 'uuid', example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' }, email: { type: 'string', format: 'email', example: 'test@bankapi.com' }, fullName: { type: 'string', example: 'Test User' }, phone: { type: 'string', example: '+1234567890' }, createdAt: { type: 'string', format: 'date-time', example: '2026-05-15T12:00:00.000Z' } } },
        Account: { type: 'object', properties: { id: { type: 'string', format: 'uuid', example: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' }, userId: { type: 'string', format: 'uuid' }, accountNumber: { type: 'string', example: '1234567890' }, accountType: { type: 'string', enum: ['savings', 'checking'], example: 'savings' }, balance: { type: 'number', example: 5000 }, currency: { type: 'string', example: 'USD' }, isActive: { type: 'boolean', example: true }, createdAt: { type: 'string', format: 'date-time' } } },
        Transfer: { type: 'object', properties: { id: { type: 'string', format: 'uuid', example: 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' }, fromAccountId: { type: 'string', format: 'uuid' }, toAccountId: { type: 'string', format: 'uuid' }, fromAccountNumber: { type: 'string' }, toAccountNumber: { type: 'string' }, amount: { type: 'number', example: 500 }, currency: { type: 'string', example: 'USD' }, description: { type: 'string' }, status: { type: 'string', enum: ['pending', 'completed', 'failed', 'cancelled'], example: 'completed' }, transferType: { type: 'string', enum: ['internal', 'external'], example: 'internal' }, reference: { type: 'string' }, createdAt: { type: 'string', format: 'date-time' } } },
        Beneficiary: { type: 'object', properties: { id: { type: 'string', format: 'uuid' }, userId: { type: 'string', format: 'uuid' }, name: { type: 'string', example: 'John Doe' }, accountNumber: { type: 'string', example: '5551234567' }, bankName: { type: 'string', example: 'Bank of America' }, relationship: { type: 'string', example: 'friend' }, isActive: { type: 'boolean', example: true }, createdAt: { type: 'string', format: 'date-time' } } },
        Deposit: { type: 'object', properties: { id: { type: 'string', format: 'uuid' }, accountId: { type: 'string', format: 'uuid' }, amount: { type: 'number', example: 500 }, depositType: { type: 'string', example: 'bank_transfer' }, confirmationNumber: { type: 'string', example: 'DEP1234567890' }, previousBalance: { type: 'number', example: 5000 }, newBalance: { type: 'number', example: 5500 }, status: { type: 'string', example: 'completed' }, createdAt: { type: 'string', format: 'date-time' } } },
        Payment: { type: 'object', properties: { id: { type: 'string', format: 'uuid' }, confirmationNumber: { type: 'string', example: 'PAY1234567890' }, serviceId: { type: 'string', example: 'electricity' }, serviceName: { type: 'string', example: 'Electricidad' }, amount: { type: 'number', example: 100 }, processingFee: { type: 'number', example: 1.5 }, totalAmount: { type: 'number', example: 101.5 }, status: { type: 'string', example: 'completed' }, createdAt: { type: 'string', format: 'date-time' } } },
        VirtualCard: { type: 'object', properties: { id: { type: 'string', format: 'uuid' }, cardNumber: { type: 'string', example: '4532019326234727' }, cardType: { type: 'string', example: 'virtual' }, cvv: { type: 'string', example: '354' }, expiryDate: { type: 'string', example: '05/29' }, cardHolderName: { type: 'string', example: 'Test User' }, isActive: { type: 'boolean', example: true }, dailyLimit: { type: 'number', example: 1000 }, dailySpent: { type: 'number', example: 0 }, createdAt: { type: 'string', format: 'date-time' } } },
        Service: { type: 'object', properties: { id: { type: 'string', example: 'electricity' }, name: { type: 'string', example: 'Electricidad' }, category: { type: 'string', example: 'utilities' }, processingFee: { type: 'number', example: 1.5 } } },
        AuthResponse: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { type: 'object', properties: { user: { type: 'object' }, accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' }, refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' } } } } },
        Error: { type: 'object', properties: { success: { type: 'boolean', example: false }, error: { type: 'object', properties: { code: { type: 'string', example: 'INVALID_CREDENTIALS' }, message: { type: 'string', example: 'Invalid credentials' } } } } }
      }
    },
    paths: {
      '/api/auth/register': {
        post: {
          summary: 'Registrar usuario',
          tags: ['Autenticación'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { type: 'object', required: ['email', 'password', 'fullName'], properties: { email: { type: 'string', format: 'email', example: 'test@bankapi.com' }, password: { type: 'string', example: 'password123' }, fullName: { type: 'string', example: 'Test User' }, phone: { type: 'string', example: '+1234567890' } } },
                example: { email: 'test@bankapi.com', password: 'password123', fullName: 'Test User' }
              }
            }
          },
          responses: {
            201: { description: 'Usuario creado', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' }, example: { success: true, data: { user: { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', email: 'test@bankapi.com', fullName: 'Test User' }, accessToken: 'eyJhbGciOiJIUzI1NiIs...', refreshToken: 'eyJhbGciOiJIUzI1NiIs...' } } } } },
            400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' }, example: { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid request data' } } } } },
            409: { description: 'User exists', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' }, example: { success: false, error: { code: 'USER_EXISTS', message: 'User already exists' } } } } }
          }
        }
      },
      '/api/auth/login': {
        post: {
          summary: 'Iniciar sesión',
          tags: ['Autenticación'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { type: 'object', required: ['email', 'password'], properties: { email: { type: 'string', format: 'email', example: 'test@bankapi.com' }, password: { type: 'string', example: 'password123' } } },
                example: { email: 'test@bankapi.com', password: 'password123' }
              }
            }
          },
          responses: {
            200: { description: 'Login exitoso', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' }, example: { success: true, data: { user: { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', email: 'test@bankapi.com', fullName: 'Test User', phone: '+1234567890' }, accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' } } } } },
            401: { description: 'Invalid credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' }, example: { success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' } } } } }
          }
        }
      },
      '/api/auth/refresh': {
        post: {
          summary: 'Refrescar token',
          tags: ['Autenticación'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { type: 'object', required: ['refreshToken'], properties: { refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' } } },
                example: { refreshToken: 'eyJhbGciOiJIUzI1NiIs...' }
              }
            }
          },
          responses: {
            200: { description: 'Tokens refreshados', content: { 'application/json': { example: { success: true, data: { accessToken: 'eyJhbGciOiJIUzI1NiIs...', refreshToken: 'eyJhbGciOiJIUzI1NiIs...' } } } } },
            401: { description: 'Invalid token', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' }, example: { success: false, error: { code: 'INVALID_REFRESH_TOKEN', message: 'Invalid refresh token' } } } } }
          }
        }
      },
      '/api/accounts': {
        get: {
          summary: 'Listar cuentas',
          tags: ['Cuentas'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Lista de cuentas', content: { 'application/json': { example: { success: true, data: [{ id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', userId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', accountNumber: '1234567890', accountType: 'savings', balance: 5000, currency: 'USD', isActive: true, createdAt: '2026-05-15T12:00:00.000Z' }] } } } },
            401: { description: 'Unauthorized', content: { 'application/json': { example: { success: false, error: { code: 'UNAUTHORIZED', message: 'No token provided' } } } } }
          }
        },
        post: {
          summary: 'Crear cuenta',
          tags: ['Cuentas'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { type: 'object', required: ['accountType'], properties: { accountType: { type: 'string', enum: ['savings', 'checking'], example: 'savings' }, currency: { type: 'string', example: 'USD' }, initialBalance: { type: 'number', example: 1000 } } },
                example: { accountType: 'savings', currency: 'USD', initialBalance: 1000 }
              }
            }
          },
          responses: {
            201: { description: 'Cuenta creada', content: { 'application/json': { example: { success: true, data: { id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', userId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', accountNumber: '9876543211', accountType: 'savings', balance: 1000, currency: 'USD', isActive: true } } } } },
            400: { description: 'Validation error', content: { 'application/json': { example: { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid request data' } } } } }
          }
        }
      },
      '/api/accounts/{id}': {
        get: {
          summary: 'Obtener cuenta',
          tags: ['Cuentas'],
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, example: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' }],
          responses: {
            200: { description: 'Detalles de cuenta', content: { 'application/json': { example: { success: true, data: { id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', accountNumber: '1234567890', accountType: 'savings', balance: 5000, currency: 'USD' } } } } },
            404: { description: 'Not found', content: { 'application/json': { example: { success: false, error: { code: 'ACCOUNT_NOT_FOUND', message: 'Account not found' } } } } }
          }
        }
      },
      '/api/accounts/{id}/balance': {
        get: {
          summary: 'Obtener saldo',
          tags: ['Cuentas'],
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, example: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' }],
          responses: {
            200: { description: 'Saldo de cuenta', content: { 'application/json': { example: { success: true, data: { accountId: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', accountNumber: '1234567890', balance: 5000, currency: 'USD', availableBalance: 5000, ledgerBalance: 5000 } } } } }
          }
        }
      },
      '/api/transfers': {
        get: {
          summary: 'Listar transferencias',
          tags: ['Transferencias'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Lista de transferencias', content: { 'application/json': { example: { success: true, data: [{ id: 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', fromAccountId: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', toAccountId: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', fromAccountNumber: '1234567890', toAccountNumber: '9876543210', amount: 500, currency: 'USD', description: 'Payment for services', status: 'completed', transferType: 'internal', reference: 'TRF001', createdAt: '2026-05-15T12:00:00.000Z' }], pagination: { limit: 20, offset: 0 } } } } }
          }
        },
        post: {
          summary: 'Ejecutar transferencia',
          tags: ['Transferencias'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { type: 'object', required: ['fromAccountId', 'toAccountId', 'amount'], properties: { fromAccountId: { type: 'string', format: 'uuid' }, toAccountId: { type: 'string', format: 'uuid' }, amount: { type: 'number' }, description: { type: 'string' }, transferType: { type: 'string' } } },
                example: { fromAccountId: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', toAccountId: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', amount: 100, description: 'Test transfer', transferType: 'internal' }
              }
            }
          },
          responses: {
            201: { description: 'Transferencia completada', content: { 'application/json': { example: { success: true, data: { id: 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', fromAccountId: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', toAccountId: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', amount: 100, currency: 'USD', description: 'Test transfer', status: 'completed', transferType: 'internal', reference: 'TRF1234567890', createdAt: '2026-05-15T12:00:00.000Z' } } } } },
            400: { description: 'Validation error', content: { 'application/json': { example: { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid request data' } } } } },
            422: { description: 'Insufficient funds', content: { 'application/json': { example: { success: false, error: { code: 'INSUFFICIENT_FUNDS', message: 'Insufficient funds' } } } } }
          }
        }
      },
      '/api/transfers/{id}': {
        get: {
          summary: 'Obtener transferencia',
          tags: ['Transferencias'],
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, example: 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' }],
          responses: {
            200: { description: 'Detalles de transferencia', content: { 'application/json': { example: { success: true, data: { id: 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', amount: 500, status: 'completed' } } } } },
            404: { description: 'Not found', content: { 'application/json': { example: { success: false, error: { code: 'TRANSFER_NOT_FOUND', message: 'Transfer not found' } } } } }
          }
        }
      },
      '/api/beneficiaries': {
        get: {
          summary: 'Listar beneficiarios',
          tags: ['Beneficiarios'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Lista de beneficiarios', content: { 'application/json': { example: { success: true, data: [{ id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', name: 'John Doe', accountNumber: '5551234567', bankName: 'Bank of America', relationship: 'friend', isActive: true }] } } } }
          }
        },
        post: {
          summary: 'Agregar beneficiario',
          tags: ['Beneficiarios'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                example: { name: 'John Doe', accountNumber: '5551234567', bankName: 'Bank of America', relationship: 'friend' }
              }
            }
          },
          responses: {
            201: { description: 'Beneficiario creado', content: { 'application/json': { example: { success: true, data: { id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', name: 'John Doe', accountNumber: '5551234567', isActive: true } } } } },
            409: { description: 'Already exists', content: { 'application/json': { example: { success: false, error: { code: 'BENEFICIARY_EXISTS', message: 'Beneficiary already exists' } } } } }
          }
        }
      },
      '/api/beneficiaries/{id}': {
        delete: {
          summary: 'Eliminar beneficiario',
          tags: ['Beneficiarios'],
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, example: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' }],
          responses: {
            200: { description: 'Eliminado', content: { 'application/json': { example: { success: true, data: { message: 'Beneficiary deleted successfully' } } } } },
            404: { description: 'Not found', content: { 'application/json': { example: { success: false, error: { code: 'BENEFICIARY_NOT_FOUND', message: 'Beneficiary not found' } } } } }
          }
        }
      },
      '/api/deposits': {
        get: {
          summary: 'Listar depósitos',
          tags: ['Depósitos'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Lista de depósitos', content: { 'application/json': { example: { success: true, data: [{ id: 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', accountId: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', amount: 500, depositType: 'bank_transfer', confirmationNumber: 'DEP1234567890', status: 'completed' }] } } } }
          }
        },
        post: {
          summary: 'Añadir saldo',
          tags: ['Depósitos'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                example: { accountId: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', amount: 500, depositType: 'bank_transfer', reference: 'Salary deposit' }
              }
            }
          },
          responses: {
            201: { description: 'Depósito exitoso', content: { 'application/json': { example: { success: true, data: { id: 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', confirmationNumber: 'DEP1234567890', accountId: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', amount: 500, depositType: 'bank_transfer', previousBalance: 5000, newBalance: 5500, status: 'completed' } } } } },
            400: { description: 'Invalid amount', content: { 'application/json': { example: { success: false, error: { code: 'INVALID_AMOUNT', message: 'Amount must be positive' } } } } },
            404: { description: 'Account not found', content: { 'application/json': { example: { success: false, error: { code: 'ACCOUNT_NOT_FOUND', message: 'Account not found' } } } } }
          }
        }
      },
      '/api/deposits/{id}': {
        get: {
          summary: 'Obtener depósito',
          tags: ['Depósitos'],
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, example: 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' }],
          responses: {
            200: { description: 'Detalles del depósito', content: { 'application/json': { example: { success: true, data: { id: 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', amount: 500 } } } } },
            404: { description: 'Not found', content: { 'application/json': { example: { success: false, error: { code: 'DEPOSIT_NOT_FOUND', message: 'Deposit not found' } } } } }
          }
        }
      },
      '/api/payments/services': {
        get: {
          summary: 'Listar servicios',
          tags: ['Pagos'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Lista de servicios', content: { 'application/json': { example: { success: true, data: [{ id: 'electricity', name: 'Electricidad', category: 'utilities', processingFee: 1.5 }, { id: 'water', name: 'Agua', category: 'utilities', processingFee: 1 }, { id: 'internet', name: 'Internet', category: 'telecom', processingFee: 2 }] } } } }
          }
        }
      },
      '/api/payments': {
        get: {
          summary: 'Listar pagos',
          tags: ['Pagos'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Lista de pagos', content: { 'application/json': { example: { success: true, data: [{ id: 'g0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', serviceId: 'electricity', serviceName: 'Electricidad', amount: 100, processingFee: 1.5, totalAmount: 101.5, confirmationNumber: 'PAY1234567890', status: 'completed' }] } } } }
          }
        },
        post: {
          summary: 'Pagar servicio',
          tags: ['Pagos'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                example: { accountId: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', serviceId: 'electricity', amount: 100, reference: 'Bill #12345' }
              }
            }
          },
          responses: {
            201: { description: 'Pago exitoso', content: { 'application/json': { example: { success: true, data: { id: 'g0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', confirmationNumber: 'PAY1234567890', serviceId: 'electricity', serviceName: 'Electricidad', amount: 100, processingFee: 1.5, totalAmount: 101.5, newBalance: 4898.5, status: 'completed' } } } } },
            400: { description: 'Invalid amount', content: { 'application/json': { example: { success: false, error: { code: 'INVALID_AMOUNT', message: 'Invalid amount' } } } } },
            404: { description: 'Service not found', content: { 'application/json': { example: { success: false, error: { code: 'SERVICE_NOT_FOUND', message: 'Service not found' } } } } },
            422: { description: 'Insufficient funds', content: { 'application/json': { example: { success: false, error: { code: 'INSUFFICIENT_FUNDS', message: 'Insufficient funds' } } } } }
          }
        }
      },
      '/api/payments/{id}': {
        get: {
          summary: 'Obtener pago',
          tags: ['Pagos'],
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, example: 'g0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' }],
          responses: {
            200: { description: 'Detalles del pago', content: { 'application/json': { example: { success: true, data: { id: 'g0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', amount: 100, confirmationNumber: 'PAY1234567890' } } } } },
            404: { description: 'Not found', content: { 'application/json': { example: { success: false, error: { code: 'PAYMENT_NOT_FOUND', message: 'Payment not found' } } } } }
          }
        }
      },
      '/api/cards': {
        get: {
          summary: 'Listar tarjetas',
          tags: ['Tarjetas'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Lista de tarjetas', content: { 'application/json': { example: { success: true, data: [{ id: '71944084-0a57-44bc-b748-1bd498342cb5', cardNumber: '4532019326234727', cardType: 'virtual', cvv: '354', expiryDate: '05/29', cardHolderName: 'Test User', isActive: true, dailyLimit: 1000 }] } } } }
          }
        },
        post: {
          summary: 'Crear tarjeta',
          tags: ['Tarjetas'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                example: { accountId: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', cardType: 'virtual', cardHolderName: 'Test User' }
              }
            }
          },
          responses: {
            201: { description: 'Tarjeta creada', content: { 'application/json': { example: { success: true, data: { id: '71944084-0a57-44bc-b748-1bd498342cb5', cardNumber: '4532019326234727', cardType: 'virtual', cvv: '354', expiryDate: '05/29', cardHolderName: 'Test User', isActive: true, dailyLimit: 1000 } } } } },
            404: { description: 'Account not found', content: { 'application/json': { example: { success: false, error: { code: 'ACCOUNT_NOT_FOUND', message: 'Account not found' } } } } }
          }
        }
      },
      '/api/cards/{id}': {
        get: {
          summary: 'Obtener tarjeta',
          tags: ['Tarjetas'],
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, example: '71944084-0a57-44bc-b748-1bd498342cb5' }],
          responses: {
            200: { description: 'Detalles de tarjeta', content: { 'application/json': { example: { success: true, data: { id: '71944084-0a57-44bc-b748-1bd498342cb5', cardNumber: '4532019326234727' } } } } },
            404: { description: 'Not found', content: { 'application/json': { example: { success: false, error: { code: 'CARD_NOT_FOUND', message: 'Card not found' } } } } }
          }
        },
        delete: {
          summary: 'Desactivar tarjeta',
          tags: ['Tarjetas'],
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, example: '71944084-0a57-44bc-b748-1bd498342cb5' }],
          responses: {
            200: { description: 'Tarjeta desactivada', content: { 'application/json': { example: { success: true, data: { message: 'Card deactivated successfully' } } } } },
            404: { description: 'Not found', content: { 'application/json': { example: { success: false, error: { code: 'CARD_NOT_FOUND', message: 'Card not found' } } } } }
          }
        }
      },
      '/api/cards/{id}/add-funds': {
        post: {
          summary: 'Añadir fondos',
          tags: ['Tarjetas'],
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, example: '71944084-0a57-44bc-b748-1bd498342cb5' }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                example: { amount: 200 }
              }
            }
          },
          responses: {
            200: { description: 'Fondos añadidos', content: { 'application/json': { example: { success: true, data: { cardId: '71944084-0a57-44bc-b748-1bd498342cb5', amount: 200, newBalance: 5200, transactionId: 't0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15' } } } } },
            400: { description: 'Invalid amount', content: { 'application/json': { example: { success: false, error: { code: 'INVALID_AMOUNT', message: 'Amount must be positive' } } } } },
            404: { description: 'Card not found', content: { 'application/json': { example: { success: false, error: { code: 'CARD_NOT_FOUND', message: 'Card not found' } } } } }
          }
        }
      },
      '/api/cards/{id}/transactions': {
        get: {
          summary: 'Transacciones de tarjeta',
          tags: ['Tarjetas'],
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, example: '71944084-0a57-44bc-b748-1bd498342cb5' }],
          responses: {
            200: { description: 'Lista de transacciones', content: { 'application/json': { example: { success: true, data: [{ id: 't0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', cardId: '71944084-0a57-44bc-b748-1bd498342cb5', transactionType: 'deposit', amount: 200, description: 'Funds added to card', status: 'completed', createdAt: '2026-05-15T12:00:00.000Z' }] } } } }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js']
};

const specs = swaggerJsdoc(options);
module.exports = specs;