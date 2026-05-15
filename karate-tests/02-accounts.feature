@ignore
Feature: Gestión de Cuentas

  Background:
    * url baseUrl
    * def tokenHolder = {}

  @setup
  Scenario: Obtener token de autenticación
    Given path 'api/auth/login'
    And request { email: 'test@bankapi.com', password: 'password123' }
    When method post
    * tokenHolder.token = response.data.accessToken
    * print 'Token obtained: ' + tokenHolder.token

  @accounts
  Scenario: Listar cuentas del usuario autenticado
    Given path 'api/accounts'
    And header Authorization = 'Bearer ' + tokenHolder.token
    When method get
    Then status 200
    And match response.success == true
    And match response.data == '#array'
    And match each response.data contains { accountNumber: '#string', balance: '#number' }
    * def firstAccountId = response.data[0].id
    * print 'First account ID: ' + firstAccountId

  @accounts
  Scenario: Obtener cuenta específica por ID
    Given path 'api/accounts'
    And header Authorization = 'Bearer ' + tokenHolder.token
    When method get
    * def accountId = response.data[0].id

    Given path 'api/accounts/' + accountId
    And header Authorization = 'Bearer ' + tokenHolder.token
    When method get
    Then status 200
    And match response.success == true
    And match response.data.id == accountId
    And match response.data.accountNumber == '#string'
    And match response.data.accountType == '#string'

  @accounts
  Scenario: Obtener cuenta que no existe - 404
    Given path 'api/accounts/00000000-0000-0000-0000-000000000000'
    And header Authorization = 'Bearer ' + tokenHolder.token
    When method get
    Then status 404
    And match response.error.code == 'ACCOUNT_NOT_FOUND'

  @accounts
  Scenario: Obtener saldo de cuenta
    Given path 'api/accounts'
    And header Authorization = 'Bearer ' + tokenHolder.token
    When method get
    * def accountId = response.data[0].id

    Given path 'api/accounts/' + accountId + '/balance'
    And header Authorization = 'Bearer ' + tokenHolder.token
    When method get
    Then status 200
    And match response.data.accountId == accountId
    And match response.data.balance >= 0
    And match response.data.availableBalance >= 0
    And match response.data.currency == 'USD'

  @accounts
  Scenario: Crear nueva cuenta - Savings
    Given path 'api/accounts'
    And header Authorization = 'Bearer ' + tokenHolder.token
    And request { accountType: 'savings', currency: 'USD', initialBalance: 1000 }
    When method post
    Then status 201
    And match response.success == true
    And match response.data.accountType == 'savings'
    And match response.data.balance == 1000

  @accounts
  Scenario: Crear cuenta - Validation error - Tipo inválido
    Given path 'api/accounts'
    And header Authorization = 'Bearer ' + tokenHolder.token
    And request { accountType: 'invalid', currency: 'USD' }
    When method post
    Then status 400
    And match response.error.code == 'VALIDATION_ERROR'

  @accounts
  Scenario: Listar cuentas sin token - 401
    Given path 'api/accounts'
    When method get
    Then status 401
    And match response.error.code == 'UNAUTHORIZED'