@ignore
Feature: Autenticación - Login y Registro

  Background:
    * url baseUrl
    * def loginSchema = read('schemas/login-request.json')
    * def registerSchema = read('schemas/register-request.json')
    * def authResponseSchema = read('schemas/auth-response.json')

  @auth
  Scenario: Login exitoso con credenciales válidas
    Given path 'api/auth/login'
    And request { email: 'test@bankapi.com', password: 'password123' }
    When method post
    Then status 200
    And match response.success == true
    And match response.data.accessToken == '#string'
    And match response.data.refreshToken == '#string'
    And match response.data.user == '#object'
    And match response.data.user.email == 'test@bankapi.com'
    * def authToken = response.data.accessToken

  @auth
  Scenario: Login falla con credenciales inválidas
    Given path 'api/auth/login'
    And request { email: 'invalid@test.com', password: 'wrongpass' }
    When method post
    Then status 401
    And match response.success == false
    And match response.error.code == 'INVALID_CREDENTIALS'

  @auth
  Scenario: Login falla sin email
    Given path 'api/auth/login'
    And request { password: 'password123' }
    When method post
    Then status 400
    And match response.success == false
    And match response.error.code == 'VALIDATION_ERROR'

  @auth
  Scenario: Registro de nuevo usuario
    Given path 'api/auth/register'
    And def randomEmail = 'test' + Math.random() + '@bankapi.com'
    And request { email: '#(randomEmail)', password: 'Password123!', fullName: 'Test User' }
    When method post
    Then status 201
    And match response.success == true
    And match response.data.accessToken == '#string'
    And match response.data.user.email == '#(randomEmail)'

  @auth
  Scenario: Registro falla con email existente
    Given path 'api/auth/register'
    And request { email: 'test@bankapi.com', password: 'Password123!', fullName: 'Test User' }
    When method post
    Then status 409
    And match response.error.code == 'USER_EXISTS'

  @auth
  Scenario: Refresh token exitoso
    Given path 'api/auth/login'
    And request { email: 'test@bankapi.com', password: 'password123' }
    When method post
    * def refreshToken = response.data.refreshToken

    Given path 'api/auth/refresh'
    And request { refreshToken: '#(refreshToken)' }
    When method post
    Then status 200
    And match response.accessToken == '#string'
    And match response.refreshToken == '#string'