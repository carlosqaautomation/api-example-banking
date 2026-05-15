@ignore
Feature: Data Driven Testing - Login con CSV

  @ddt
  Scenario Outline: Login con diferentes datos - <email>
    Given url baseUrl
    And path 'api/auth/login'
    And request { email: '<email>', password: '<password>' }
    When method post
    Then status <expectedStatus>
    * if (<expectedStatus> == 200) karate.match(response.success == true)
    * if (<expectedStatus> != 200) karate.match(response.success == false)
    * if (<expectedErrorCode> != '') karate.match(response.error.code == '<expectedErrorCode>')

    Examples:
      | read('data/login-test-data.csv') |