@ignore
Feature: Depósitos - Añadir Saldo a Cuentas

  Background:
    * url baseUrl
    * def tokenHolder = {}

  @setup
  Scenario: Obtener token y cuenta
    Given path 'api/auth/login'
    And request { email: 'test@bankapi.com', password: 'password123' }
    When method post
    * tokenHolder.token = response.data.accessToken

    Given path 'api/accounts'
    And header Authorization = 'Bearer ' + tokenHolder.token
    When method get
    * tokenHolder.accountId = response.data[0].id
    * print 'Account ID: ' + tokenHolder.accountId

  @deposit
  Scenario: Añadir saldo exitosamente
    Given path 'api/deposits'
    And header Authorization = 'Bearer ' + tokenHolder.token
    And request
      """
      {
        "accountId": "$(tokenHolder.accountId)",
        "amount": 500,
        "depositType": "bank_transfer",
        "reference": "Salary deposit"
      }
      """
    When method post
    Then status 201
    And match response.success == true
    And match response.data.amount == 500
    And match response.data.confirmationNumber == '#string'
    And match response.data.status == 'completed'

  @deposit
  Scenario: Añadir saldo - Amount negativo
    Given path 'api/deposits'
    And header Authorization = 'Bearer ' + tokenHolder.token
    And request
      """
      {
        "accountId": "$(tokenHolder.accountId)",
        "amount": -100,
        "depositType": "bank_transfer"
      }
      """
    When method post
    Then status 400
    And match response.error.code == 'INVALID_AMOUNT'

  @deposit
  Scenario: Añadir saldo - Amount cero
    Given path 'api/deposits'
    And header Authorization = 'Bearer ' + tokenHolder.token
    And request
      """
      {
        "accountId": "$(tokenHolder.accountId)",
        "amount": 0,
        "depositType": "bank_transfer"
      }
      """
    When method post
    Then status 400
    And match response.error.code == 'INVALID_AMOUNT'

  @deposit
  Scenario: Añadir saldo - Excede límite máximo
    Given path 'api/deposits'
    And header Authorization = 'Bearer ' + tokenHolder.token
    And request
      """
      {
        "accountId": "$(tokenHolder.accountId)",
        "amount": 150000,
        "depositType": "bank_transfer"
      }
      """
    When method post
    Then status 400
    And match response.error.code == 'MAX_AMOUNT_EXCEEDED'

  @deposit
  Scenario: Añadir saldo - Cuenta no encontrada
    Given path 'api/deposits'
    And header Authorization = 'Bearer ' + tokenHolder.token
    And request
      """
      {
        "accountId": "00000000-0000-0000-0000-000000000000",
        "amount": 100,
        "depositType": "bank_transfer"
      }
      """
    When method post
    Then status 404
    And match response.error.code == 'ACCOUNT_NOT_FOUND'

  @deposit
  Scenario: Lista de depósitos
    Given path 'api/deposits'
    And header Authorization = 'Bearer ' + tokenHolder.token
    When method get
    Then status 200
    And match response.success == true
    And match response.data == '#array'
    And match each response.data contains { amount: '#number', confirmationNumber: '#string' }

  @deposit
  Scenario: Obtener depósito por ID
    Given path 'api/deposits'
    And header Authorization = 'Bearer ' + tokenHolder.token
    When method get
    * def firstDepositId = response.data[0].id

    Given path 'api/deposits/' + firstDepositId
    And header Authorization = 'Bearer ' + tokenHolder.token
    When method get
    Then status 200
    And match response.data.id == firstDepositId