@ignore
Feature: Pagos de Servicios

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

  @payment
  Scenario: Obtener lista de servicios disponibles
    Given path 'api/payments/services'
    And header Authorization = 'Bearer ' + tokenHolder.token
    When method get
    Then status 200
    And match response.success == true
    And match response.data == '#array'
    And match each response.data contains { id: '#string', name: '#string', category: '#string', processingFee: '#number' }

  @payment
  Scenario: Pagar servicio exitosamente
    Given path 'api/payments'
    And header Authorization = 'Bearer ' + tokenHolder.token
    And request
      """
      {
        "accountId": "$(tokenHolder.accountId)",
        "serviceId": "electricity",
        "amount": 100,
        "reference": "Bill #12345"
      }
      """
    When method post
    Then status 201
    And match response.success == true
    And match response.data.serviceId == 'electricity'
    And match response.data.amount == 100
    And match response.data.confirmationNumber == '#string'
    And match response.data.status == 'completed'
    * def paymentId = response.data.id

  @payment
  Scenario: Pagar servicio - Saldo insuficiente
    Given path 'api/payments'
    And header Authorization = 'Bearer ' + tokenHolder.token
    And request
      """
      {
        "accountId": "$(tokenHolder.accountId)",
        "serviceId": "internet",
        "amount": 1000000,
        "reference": "Excessive"
      }
      """
    When method post
    Then status 422
    And match response.error.code == 'INSUFFICIENT_FUNDS'

  @payment
  Scenario: Pagar servicio - Servicio no encontrado
    Given path 'api/payments'
    And header Authorization = 'Bearer ' + tokenHolder.token
    And request
      """
      {
        "accountId": "$(tokenHolder.accountId)",
        "serviceId": "invalid_service",
        "amount": 50
      }
      """
    When method post
    Then status 404
    And match response.error.code == 'SERVICE_NOT_FOUND'

  @payment
  Scenario: Pagar servicio - Amount negativo
    Given path 'api/payments'
    And header Authorization = 'Bearer ' + tokenHolder.token
    And request
      """
      {
        "accountId": "$(tokenHolder.accountId)",
        "serviceId": "electricity",
        "amount": -50
      }
      """
    When method post
    Then status 400
    And match response.error.code == 'INVALID_AMOUNT'

  @payment
  Scenario: Lista de pagos realizados
    Given path 'api/payments'
    And header Authorization = 'Bearer ' + tokenHolder.token
    When method get
    Then status 200
    And match response.success == true
    And match response.data == '#array'
    And match each response.data contains { serviceId: '#string', amount: '#number', confirmationNumber: '#string' }

  @payment
  Scenario: Obtener pago por ID
    Given path 'api/payments'
    And header Authorization = 'Bearer ' + tokenHolder.token
    When method get
    * def firstPaymentId = response.data[0].id

    Given path 'api/payments/' + firstPaymentId
    And header Authorization = 'Bearer ' + tokenHolder.token
    When method get
    Then status 200
    And match response.data.id == firstPaymentId

  @payment
  Scenario: Validar cálculo de fee
    Given path 'api/payments'
    And header Authorization = 'Bearer ' + tokenHolder.token
    And request
      """
      {
        "accountId": "$(tokenHolder.accountId)",
        "serviceId": "mobile",
        "amount": 50,
        "reference": "Phone bill"
      }
      """
    When method post
    Then status 201
    * match response.data.processingFee == 1.50
    * match response.data.totalAmount == 51.50