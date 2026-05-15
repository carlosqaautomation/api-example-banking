# BankAPI - API Bancaria para Karate DSL

API REST de ejemplo para prácticas de automatización con Karate DSL.

## Características

- Autenticación JWT con refresh tokens
- Gestión de cuentas bancarias (savings/checking)
- Transferencias entre cuentas
- Gestión de beneficiarios
- Validación de schemas con Joi
- Documentación Swagger en `/api-docs`
- Casos de error configurados (400, 401, 403, 404, 409, 422)
- Estructura data-driven para testing

## Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login de usuario |
| POST | `/api/auth/register` | Registrar nuevo usuario |
| POST | `/api/auth/refresh` | Refresh token |
| GET | `/api/accounts` | Listar cuentas |
| GET | `/api/accounts/:id` | Obtener cuenta |
| GET | `/api/accounts/:id/balance` | Obtener saldo |
| POST | `/api/accounts` | Crear cuenta |
| GET | `/api/transfers` | Listar transferencias |
| POST | `/api/transfers` | Ejecutar transferencia |
| GET | `/api/transfers/:id` | Detalle de transferencia |
| GET | `/api/beneficiaries` | Listar beneficiarios |
| POST | `/api/beneficiaries` | Agregar beneficiario |
| DELETE | `/api/beneficiaries/:id` | Eliminar beneficiario |

##快速开始

### 1. Local Development

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Inicializar base de datos
npm run db:init

# Iniciar servidor
npm run dev
```

### 2. Despliegue en Supabase + Render

#### Paso 1: Crear proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea un nuevo proyecto
2. Anota las credenciales de conexión:
   - Host: `db.xxxxxx.supabase.co`
   - Puerto: `5432`
   - Contraseña de base de datos

#### Paso 2: Configurar base de datos

1. Ve al **SQL Editor** en Supabase
2. Copia el contenido de `src/db/init.js` (solo el schema, sin el seed)
3. Ejecuta las queries

#### Paso 3: Desplegar en Render

1. Crea una cuenta en [render.com](https://render.com)
2. Conecta tu repositorio de GitHub
3. Configura:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment Variables**:
     - `PORT`: 3000
     - `DB_HOST`: Tu host de Supabase
     - `DB_PORT`: 5432
     - `DB_NAME`: postgres
     - `DB_USER`: postgres
     - `DB_PASSWORD`: Tu contraseña de Supabase
     - `JWT_SECRET`: Una clave secreta segura
     - `SUPABASE_URL`: Tu URL de Supabase

## Testing con Karate DSL

### Estructura de tests

```
karate-tests/
├── karate-config.js      # Configuración global
├── 01-auth.feature       # Tests de autenticación
├── 02-accounts.feature   # Tests de cuentas
├── 03-transfers.feature   # Tests de transferencias
└── schemas/              # Schemas JSON para validación
```

### Ejecutar tests

```bash
# Todos los tests
karate test karate-tests/

# Tests específicos
karate test karate-tests/01-auth.feature

# Con entorno específico
karate test karate-tests/ -e dev
```

### Variables de entorno para testing

| Variable | Descripción |
|----------|-------------|
| `baseUrl` | URL base de la API |
| `authToken` | Token de autenticación |

## Credenciales de prueba

- **Email**: `test@bankapi.com`
- **Password**: `password123`

## Ejemplos de Respuestas JSON

### POST /api/auth/login
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      "email": "test@bankapi.com",
      "fullName": "Test User",
      "phone": "+1234567890"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### GET /api/accounts
```json
{
  "success": true,
  "data": [
    {
      "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      "userId": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      "accountNumber": "1234567890",
      "accountType": "savings",
      "balance": 5000,
      "currency": "USD",
      "isActive": true,
      "createdAt": "2026-05-16T03:45:44.872Z"
    }
  ]
}
```

### GET /api/accounts/:id/balance
```json
{
  "success": true,
  "data": {
    "accountId": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "accountNumber": "1234567890",
    "balance": 5000,
    "currency": "USD",
    "availableBalance": 5000,
    "ledgerBalance": 5000
  }
}
```

### GET /api/transfers
```json
{
  "success": true,
  "data": [
    {
      "id": "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      "fromAccountId": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      "toAccountId": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13",
      "fromAccountNumber": "1234567890",
      "toAccountNumber": "9876543210",
      "amount": 500,
      "currency": "USD",
      "description": "Payment for services",
      "status": "completed",
      "transferType": "internal",
      "reference": "TRF001",
      "createdAt": "2026-05-16T03:45:44.872Z"
    }
  ],
  "pagination": { "limit": 20, "offset": 0 }
}
```

### POST /api/transfers
```json
{
  "success": true,
  "data": {
    "id": "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15",
    "fromAccountId": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "toAccountId": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12",
    "amount": 100,
    "currency": "USD",
    "description": "Test transfer",
    "status": "completed",
    "transferType": "internal",
    "reference": "TRF1234567890",
    "createdAt": "2026-05-16T04:00:00.000Z"
  }
}
```

### GET /api/beneficiaries
```json
{
  "success": true,
  "data": [
    {
      "id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      "userId": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      "name": "John Doe",
      "accountNumber": "5551234567",
      "bankName": "Bank of America",
      "relationship": "friend",
      "isActive": true,
      "createdAt": "2026-05-16T03:45:44.872Z"
    }
  ]
}
```

### GET /api/payments/services
```json
{
  "success": true,
  "data": [
    { "id": "electricity", "name": "Electricidad", "category": "utilities", "processingFee": 1.5 },
    { "id": "water", "name": "Agua", "category": "utilities", "processingFee": 1 },
    { "id": "gas", "name": "Gas", "category": "utilities", "processingFee": 1.25 },
    { "id": "internet", "name": "Internet", "category": "telecom", "processingFee": 2 },
    { "id": "mobile", "name": "Teléfono Móvil", "category": "telecom", "processingFee": 1.5 },
    { "id": "tv", "name": "Televisión por Cable", "category": "entertainment", "processingFee": 3 },
    { "id": "insurance", "name": "Seguro", "category": "insurance", "processingFee": 5 },
    { "id": "credit-card", "name": "Tarjeta de Crédito", "category": "financial", "processingFee": 2.5 },
    { "id": "loan", "name": "Préstamo", "category": "financial", "processingFee": 3 }
  ]
}
```

### POST /api/payments
```json
{
  "success": true,
  "data": {
    "id": "g0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15",
    "confirmationNumber": "PAY1234567890",
    "serviceId": "electricity",
    "serviceName": "Electricidad",
    "amount": 100,
    "processingFee": 1.5,
    "totalAmount": 101.5,
    "newBalance": 4898.5,
    "status": "completed",
    "createdAt": "2026-05-16T04:00:00.000Z"
  }
}
```

### POST /api/deposits
```json
{
  "success": true,
  "data": {
    "id": "f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15",
    "confirmationNumber": "DEP1234567890",
    "accountId": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "accountNumber": "1234567890",
    "amount": 500,
    "depositType": "bank_transfer",
    "previousBalance": 5000,
    "newBalance": 5500,
    "status": "completed",
    "createdAt": "2026-05-16T04:00:00.000Z"
  }
}
```

### POST /api/cards
```json
{
  "success": true,
  "data": {
    "id": "71944084-0a57-44bc-b748-1bd498342cb5",
    "userId": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "accountId": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "cardNumber": "4532019326234727",
    "cardType": "virtual",
    "cvv": "354",
    "expiryDate": "05/29",
    "cardHolderName": "Test User",
    "isActive": true,
    "dailyLimit": 1000,
    "dailySpent": 0,
    "createdAt": "2026-05-16T03:53:37.550Z"
  }
}
```

### POST /api/cards/:id/add-funds
```json
{
  "success": true,
  "data": {
    "cardId": "71944084-0a57-44bc-b748-1bd498342cb5",
    "amount": 200,
    "newBalance": 5200,
    "transactionId": "t0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15"
  }
}
```

### Errores (Todos los endpoints)

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description"
  }
}
```

**Códigos de error comunes:**
- `UNAUTHORIZED` - Token no proporcionado o inválido (401)
- `INVALID_CREDENTIALS` - Credenciales incorrectas (401)
- `ACCOUNT_NOT_FOUND` - Cuenta no existe (404)
- `INSUFFICIENT_FUNDS` - Saldo insuficiente (422)
- `VALIDATION_ERROR` - Datos inválidos (400)
- `CARD_NOT_FOUND` - Tarjeta no encontrada (404)

## Documentación

Swagger UI disponible en: `http://localhost:3000/api-docs`

## Tech Stack

- Node.js 18+
- Express.js
- PostgreSQL (Supabase)
- JWT
- Joi (validación)
- Swagger/OpenAPI 3.0