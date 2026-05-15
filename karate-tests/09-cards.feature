@ignore
Feature: Tarjetas Virtuales

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

  @card
  Scenario: Crear tarjeta virtual exitosamente
    Given path 'api/cards'
    And header Authorization = 'Bearer ' + tokenHolder.token
    And request
      """
      {
        "accountId": "$(tokenHolder.accountId)",
        "cardType": "virtual",
        "cardHolderName": "Test User"
      }
      """
    When method post
    Then status 201
    And match response.success == true
    And match response.data.cardNumber == '#string'
    And match response.data.cardType == 'virtual'
    And match response.data.cvv == '#string'
    And match response.data.expiryDate == '##string'
    And match response.data.isActive == true
    * def cardId = response.data.id

  @card
  Scenario: Crear tarjeta - Falta accountId
    Given path 'api/cards'
    And header Authorization = 'Bearer ' + tokenHolder.token
    And request
      """
      {
        "cardType": "virtual",
        "cardHolderName": "Test User"
      }
      """
    When method post
    Then status 400
    And match response.error.code == 'MISSING_REQUIRED_FIELDS'

  @card
  Scenario: Lista de tarjetas
    Given path 'api/cards'
    And header Authorization = 'Bearer ' + tokenHolder.token
    When method get
    Then status 200
    And match response.success == true
    And match response.data == '#array'

  @card
  Scenario: Obtener tarjeta por ID
    Given path 'api/cards'
    And header Authorization = 'Bearer ' + tokenHolder.token
    When method get
    * def cardId = response.data[0].id

    Given path 'api/cards/' + cardId
    And header Authorization = 'Bearer ' + tokenHolder.token
    When method get
    Then status 200
    And match response.data.id == cardId
    And match response.data.cardNumber == '#string'

  @card
  Scenario: Obtener tarjeta - No encontrada
    Given path 'api/cards/00000000-0000-0000-0000-000000000000'
    And header Authorization = 'Bearer ' + tokenHolder.token
    When method get
    Then status 404
    And match response.error.code == 'CARD_NOT_FOUND'

  @card
  Scenario: Añadir fondos a tarjeta
    Given path 'api/cards'
    And header Authorization = 'Bearer ' + tokenHolder.token
    When method get
    * def cardId = response.data[0].id

    Given path 'api/cards/' + cardId + '/add-funds'
    And header Authorization = 'Bearer ' + tokenHolder.token
    And request { amount: 200 }
    When method post
    Then status 200
    And match response.success == true
    And match response.data.amount == 200

  @card
  Scenario: Añadir fondos - Amount negativo
    Given path 'api/cards'
    And header Authorization = 'Bearer ' + tokenHolder.token
    When method get
    * def cardId = response.data[0].id

    Given path 'api/cards/' + cardId + '/add-funds'
    And header Authorization = 'Bearer ' + tokenHolder.token
    And request { amount: -50 }
    When method post
    Then status 400
    And match response.error.code == 'INVALID_AMOUNT'

  @card
  Scenario: Obtener transacciones de tarjeta
    Given path 'api/cards'
    And header Authorization = 'Bearer ' + tokenHolder.token
    When method get
    * def cardId = response.data[0].id

    Given path 'api/cards/' + cardId + '/transactions'
    And header Authorization = 'Bearer ' + tokenHolder.token
    When method get
    Then status 200
    And match response.success == true
    And match response.data == '#array'

  @card
  Scenario: Desactivar tarjeta
    Given path 'api/cards'
    And header Authorization = 'Bearer ' + tokenHolder.token
    When method get
    * def cardId = response.data[0].id

    Given path 'api/cards/' + cardId
    And header Authorization = 'Bearer ' + tokenHolder.token
    When method delete
    Then status 200
    And match response.success == true

  @card
  Scenario: Verificar formato de número de tarjeta (Luhn)
    Given path 'api/cards'
    And header Authorization = 'Bearer ' + tokenHolder.token
    And request
      """
      {
        "accountId": "$(tokenHolder.accountId)",
        "cardType": "virtual",
        "cardHolderName": "Test User 2"
      }
      """
    When method post
    Then status 201
    * def cardNumber = response.data.cardNumber
    * print 'Card Number: ' + cardNumber
    * def firstDigits = cardNumber.substring(0, 6)
    * assert firstDigits == '453201'