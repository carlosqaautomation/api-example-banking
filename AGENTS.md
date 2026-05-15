# Especificación: API Bancaria de Ejemplo para Karate DSL

## 1. Project Overview

- **Project name**: BankAPI
- **Type**: REST API (Node.js/Express) para simulacro de transacciones bancarias
- **Core functionality**: API de transferencias bancarias con autenticación, validación de schemas, manejo de errores y documentación Swagger
- **Target users**: Estudiantes de automatización con Karate DSL

## 2. Stack Tecnológico

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL (Supabase)
- **Auth**: JWT tokens
- **Documentation**: Swagger/OpenAPI 3.0
- **Deployment**: Render (connected to Supabase)

## 3. Endpoints de la API

### Autenticación
- `POST /api/auth/login` - Login de usuario, retorna JWT
- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/refresh` - Refresh token

### Cuentas
- `GET /api/accounts` - Listar cuentas del usuario autenticado
- `GET /api/accounts/:id` - Obtener detalle de cuenta
- `POST /api/accounts` - Crear nueva cuenta
- `GET /api/accounts/:id/balance` - Obtener saldo de cuenta

### Transferencias
- `GET /api/transfers` - Listar transferencias del usuario
- `POST /api/transfers` - Ejecutar transferencia entre cuentas
- `GET /api/transfers/:id` - Detalle de transferencia específica

### Beneficiarios
- `GET /api/beneficiaries` - Listar beneficiarios
- `POST /api/beneficiaries` - Agregar beneficiario
- `DELETE /api/beneficiaries/:id` - Eliminar beneficiario

## 4. Validaciones y Casos de Error

- Validación de schemas con JSON Schema
- Errores 400: datos inválidos, saldo insuficiente
- Errores 401: token inválido/expirado
- Errores 403: acceso denegado
- Errores 404: recurso no encontrado
- Errores 422: validación de negocio

## 5. Data-Driven Testing

- Estructura para testing con diferentes datasets
- Variables de entorno configurables
- Mock data para pruebas

## 6. Documentación

- Swagger UI disponible en `/api-docs`
- Todos los endpoints documentados con ejemplos de request/response