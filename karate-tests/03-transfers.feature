@ignore
Feature: Transferencias Bancarias - Data Driven Testing

  Background:
    * url baseUrl
    * def tokenHolder = {}

  @setup
  Scenario: Obtener token y cuentas
    Given path 'api/auth/login'
    And request { email: 'test@bankapi.com', password: 'password123' }
    When method post
    * tokenHolder.token = response.data.accessToken

    Given path 'api/accounts'
    And header Authorization = 'Bearer ' + tokenHolder.token
    When method get
    * def accounts = response.data
    * tokenHolder.fromAccountId = accounts[0].id
    * tokenHolder.toAccountId = accounts[1].id
    * print 'From Account: ' + tokenHolder.fromAccountId
    * print 'To Account: ' + tokenHolder.toAccountId

  @transfer
  Scenario Outline: Ejecutar transferencia - <description>
    Given path 'api/transfers'
    And header Authorization = 'Bearer ' + tokenHolder.token
    And request
      """
      {
        "fromAccountId": "<fromAccountId>",
        "toAccountId": "<toAccountId>",
        "amount": <amount>,
        "description": "<description>",
        "transferType": "<transferType>"
      }
      """
    When method post
    Then status <expectedStatus>
    And match response.success == <expectedSuccess>
    * if (expectedStatus == 200 || expectedStatus == 201) karate.set('transferId', response.data.id)

    Examples:
      | description | fromAccountId | toAccountId | amount | transferType | expectedStatus | expectedSuccess |
      | Transferencia exitosa | ref:tokenHolder.fromAccountId | ref:tokenHolder.toAccountId | 100 | internal | 201 | true |
      | Same account error | ref:tokenHolder.fromAccountId | ref:tokenHolder.fromAccountId | 50 | internal | 400 | false |
      | Amount zero error | ref:tokenHolder.fromAccountId | ref:tokenHolder.toAccountId | 0 | internal | 400 | false |
      | Amount negative error | ref:tokenHolder.fromAccountId | ref:tokenHolder.toAccountId | -100 | internal | 400 | false |

  @transfer
  Scenario: Transferencia exitosa y verificación de saldo
    * def initialBalance = 0

    Given path 'api/accounts/' + tokenHolder.fromAccountId + '/balance'
    And header Authorization = 'Bearer ' + tokenHolder.token
    When method get
    * initialBalance = response.data.balance
    * print 'Initial balance: ' + initialBalance

    Given path 'api/transfers'
    And header Authorization = 'Bearer ' + tokenHolder.token
    And request
      """
      {
        "fromAccountId": "$(tokenHolder.fromAccountId)",
        "toAccountId": "$(tokenHolder.toAccountId)",
        "amount": 50,
        "description": "Test transfer",
        "transferType": "internal"
      }
      """
    When method post
    Then status 201
    And match response.data.amount == 50
    And match response.data.status == 'completed'
    * def transferId = response.data.id

    Given path 'api/accounts/' + tokenHolder.fromAccountId + '/balance'
    And header Authorization = 'Bearer ' + tokenHolder.token
    When method get
    * def newBalance = response.data.balance
    * print 'New balance: ' + newBalance
    * assert newBalance == initialBalance - 50

  @transfer
  Scenario: Lista de transferencias
    Given path 'api/transfers'
    And header Authorization = 'Bearer ' + tokenHolder.token
    When method get
    Then status 200
    And match response.success == true
    And match response.data == '#array'
    And match each response.data contains { id: '#string', amount: '#number', status: '#string' }

  @transfer
  Scenario: Obtener transferencia por ID
    Given path 'api/transfers'
    And header Authorization = 'Bearer ' + tokenHolder.token
    When method get
    * def firstTransferId = response.data[0].id

    Given path 'api/transfers/' + firstTransferId
    And header Authorization = 'Bearer ' + tokenHolder.token
    When method get
    Then status 200
    And match response.data.id == firstTransferId

  @transfer
  Scenario: Obtener transferencia inexistente
    Given path 'api/transfers/00000000-0000-0000-0000-000000000000'
    And header Authorization = 'Bearer ' + tokenHolder.token
    When method get
    Then status 404
    And match response.error.code == 'TRANSFER_NOT_FOUND'