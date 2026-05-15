@ignore
Feature: Gestión de Beneficiarios

  Background:
    * url baseUrl

  @setup
  Scenario: Obtener token
    Given path 'api/auth/login'
    And request { email: 'test@bankapi.com', password: 'password123' }
    When method post
    * def token = response.data.accessToken

  @beneficiary
  Scenario: Listar beneficiarios
    Given path 'api/beneficiaries'
    And header Authorization = 'Bearer ' + token
    When method get
    Then status 200
    And match response.success == true
    And match response.data == '#array'

  @beneficiary
  Scenario: Agregar nuevo beneficiario
    Given path 'api/beneficiaries'
    And header Authorization = 'Bearer ' + token
    And request
      """
      {
        "name": "Test Beneficiary",
        "accountNumber": "1234567890",
        "bankName": "Test Bank",
        "relationship": "friend"
      }
      """
    When method post
    Then status 201
    And match response.success == true
    And match response.data.name == 'Test Beneficiary'
    * def beneficiaryId = response.data.id

  @beneficiary
  Scenario: Agregar beneficiario duplicado
    Given path 'api/beneficiaries'
    And header Authorization = 'Bearer ' + token
    And request
      """
      {
        "name": "John Doe",
        "accountNumber": "5551234567",
        "bankName": "Bank of America",
        "relationship": "friend"
      }
      """
    When method post
    Then status 409
    And match response.error.code == 'BENEFICIARY_EXISTS'

  @beneficiary
  Scenario: Eliminar beneficiario
    Given path 'api/beneficiaries'
    And header Authorization = 'Bearer ' + token
    When method get
    * def beneficiaryId = response.data[0].id

    Given path 'api/beneficiaries/' + beneficiaryId
    And header Authorization = 'Bearer ' + token
    When method delete
    Then status 200
    And match response.success == true