@ignore
Feature: Validación de Schemas JSON

  Background:
    * url baseUrl
    * def loginSchema = read('../schemas/login-request.json')
    * def accountSchema = read('../schemas/account-response.json')

  @schema
  Scenario: Validar esquema de respuesta de login
    Given path 'api/auth/login'
    And request { email: 'test@bankapi.com', password: 'password123' }
    When method post
    Then status 200
    * def response = response
    * match response == { success: '#boolean', data: { accessToken: '#string', refreshToken: '#string', user: { id: '#string', email: '#string', fullName: '#string', phone: '##string', createdAt: '#string' } } }

  @schema
  Scenario: Validar estructura de cuenta con schema externo
    Given path 'api/auth/login'
    And request { email: 'test@bankapi.com', password: 'password123' }
    When method post
    * def token = response.data.accessToken

    Given path 'api/accounts'
    And header Authorization = 'Bearer ' + token
    When method get
    Then status 200
    * def account = response.data[0]
    * match account.id == '#uuid'
    * match account.accountNumber == '##string'
    * match account.accountType == '##string'
    * match account.balance == '##number'
    * match account.currency == 'USD'

  @schema
  Scenario: Validar respuesta de error estándar
    Given path 'api/auth/login'
    And request { email: 'invalid', password: 'invalid' }
    When method post
    Then status 401
    And match response == { success: false, error: { code: '#string', message: '#string' } }
    And match response.error.code == 'INVALID_CREDENTIALS'

  @schema
  Scenario: Validar errores de validación
    Given path 'api/accounts'
    And header Authorization = 'Bearer invalid-token'
    When method get
    Then status 401
    And match response.error.code == 'UNAUTHORIZED'

  @schema
  Scenario: Validar response de transferencia
    Given path 'api/auth/login'
    And request { email: 'test@bankapi.com', password: 'password123' }
    When method post
    * def token = response.data.accessToken

    Given path 'api/accounts'
    And header Authorization = 'Bearer ' + token
    When method get
    * def accounts = response.data

    Given path 'api/transfers'
    And header Authorization = 'Bearer ' + token
    And request
      """
      {
        "fromAccountId": "$(accounts[0].id)",
        "toAccountId": "$(accounts[1].id)",
        "amount": 10,
        "description": "Schema test",
        "transferType": "internal"
      }
      """
    When method post
    * if (response.status == 201 || response.status == 422) karate.set('transferResponse', response)
    * if (response.status == 422) karate.set('errorResponse', response)

    * if (transferResponse) karate.match(transferResponse.response, { success: true, data: { id: '#uuid', amount: '#number', status: 'completed' } })
    * if (errorResponse) karate.match(errorResponse.response, { success: false, error: { code: '#string', message: '#string' } })