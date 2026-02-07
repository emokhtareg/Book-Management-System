Feature: Books CRUD Operations
  As a user
  I want to perform CRUD operations on books
  So that I can manage my book collection

  Background:
    Given the API base URL is "http://localhost:3000"
    And I am authenticated as a user

  Scenario: Create a new book successfully
    When I send a POST request to "/api/books" with the following data:
      | title          | author        | isbn          | publishedYear | genre    |
      | The Great Test | Test Author   | 978-1234567890| 2024          | Fiction  |
    Then the response status should be 201
    And the response should contain a book object
    And the book should have the following properties:
      | property      | value           |
      | title         | The Great Test  |
      | author        | Test Author     |
      | isbn          | 978-1234567890  |
      | publishedYear | 2024            |
      | genre         | Fiction         |
    And the book should have an "id" property
    And the book should have a "createdAt" property
    And the book should have an "updatedAt" property

  Scenario: Create a book with missing required fields
    When I send a POST request to "/api/books" with the following data:
      | title | author |
      | Test  | Author |
    Then the response status should be 400
    And the response should contain an error message "All fields are required"

  Scenario: Create a book without authentication
    Given I am not authenticated
    When I send a POST request to "/api/books" with the following data:
      | title          | author        | isbn          | publishedYear | genre    |
      | The Great Test | Test Author   | 978-1234567890| 2024          | Fiction  |
    Then the response status should be 401
    And the response should contain an error message "Unauthorized"

  Scenario: Get all books successfully
    Given I have created a book with the following data:
      | title          | author        | isbn          | publishedYear | genre    |
      | Test Book 1    | Author One    | 978-1111111111| 2020          | Fiction  |
    And I have created a book with the following data:
      | title          | author        | isbn          | publishedYear | genre    |
      | Test Book 2    | Author Two    | 978-2222222222| 2021          | Mystery  |
    When I send a GET request to "/api/books"
    Then the response status should be 200
    And the response should be an array
    And the array should contain at least 2 books
    And each book in the array should have the following properties:
      | property      |
      | id            |
      | title         |
      | author        |
      | isbn          |
      | publishedYear |
      | genre         |
      | createdAt     |
      | updatedAt     |

  Scenario: Get all books without authentication
    Given I am not authenticated
    When I send a GET request to "/api/books"
    Then the response status should be 401
    And the response should contain an error message "Unauthorized"

  Scenario: Get a single book by ID successfully
    Given I have created a book with the following data:
      | title          | author        | isbn          | publishedYear | genre    |
      | Single Book    | Single Author | 978-3333333333| 2022          | Sci-Fi   |
    And I store the book ID from the response
    When I send a GET request to "/api/books/<storedBookId>"
    Then the response status should be 200
    And the response should contain a book object
    And the book should have the following properties:
      | property      | value         |
      | title         | Single Book   |
      | author        | Single Author |
      | isbn          | 978-3333333333|
      | publishedYear | 2022          |
      | genre         | Sci-Fi        |
    And the book "id" should match "<storedBookId>"

  Scenario: Get a book with invalid ID
    When I send a GET request to "/api/books/invalid-id-12345"
    Then the response status should be 404
    And the response should contain an error message "Book not found"

  Scenario: Get a book without authentication
    Given I am not authenticated
    When I send a GET request to "/api/books/some-id"
    Then the response status should be 401
    And the response should contain an error message "Unauthorized"

  Scenario: Update a book successfully
    Given I have created a book with the following data:
      | title          | author        | isbn          | publishedYear | genre    |
      | Original Title | Original Auth | 978-4444444444| 2020          | Fiction  |
    And I store the book ID from the response
    When I send a PUT request to "/api/books/<storedBookId>" with the following data:
      | title          | author        | isbn          | publishedYear | genre    |
      | Updated Title  | Updated Auth  | 978-4444444444| 2023          | Mystery  |
    Then the response status should be 200
    And the response should contain a book object
    And the book should have the following properties:
      | property      | value         |
      | title         | Updated Title |
      | author        | Updated Auth  |
      | isbn          | 978-4444444444|
      | publishedYear | 2023          |
      | genre         | Mystery       |
    And the book "id" should match "<storedBookId>"
    And the book should have an "updatedAt" property

  Scenario: Update a book with partial data
    Given I have created a book with the following data:
      | title          | author        | isbn          | publishedYear | genre    |
      | Partial Book   | Partial Auth  | 978-5555555555| 2020          | Fiction  |
    And I store the book ID from the response
    When I send a PUT request to "/api/books/<storedBookId>" with the following data:
      | title         |
      | New Title Only|
    Then the response status should be 200
    And the response should contain a book object
    And the book "title" should be "New Title Only"

  Scenario: Update a book with invalid ID
    When I send a PUT request to "/api/books/invalid-id-12345" with the following data:
      | title         | author      |
      | Updated Title | Updated Auth|
    Then the response status should be 404
    And the response should contain an error message "Book not found"

  Scenario: Update a book without authentication
    Given I am not authenticated
    When I send a PUT request to "/api/books/some-id" with the following data:
      | title         | author      |
      | Updated Title | Updated Auth|
    Then the response status should be 401
    And the response should contain an error message "Unauthorized"

  Scenario: Delete a book successfully
    Given I have created a book with the following data:
      | title          | author        | isbn          | publishedYear | genre    |
      | Book To Delete | Delete Author | 978-6666666666| 2020          | Fiction  |
    And I store the book ID from the response
    When I send a DELETE request to "/api/books/<storedBookId>"
    Then the response status should be 200
    And the response should contain a success message "Book deleted successfully"
    When I send a GET request to "/api/books/<storedBookId>"
    Then the response status should be 404
    And the response should contain an error message "Book not found"

  Scenario: Delete a book with invalid ID
    When I send a DELETE request to "/api/books/invalid-id-12345"
    Then the response status should be 404
    And the response should contain an error message "Book not found"

  Scenario: Delete a book without authentication
    Given I am not authenticated
    When I send a DELETE request to "/api/books/some-id"
    Then the response status should be 401
    And the response should contain an error message "Unauthorized"

  Scenario: Complete CRUD workflow
    Given I have created a book with the following data:
      | title          | author        | isbn          | publishedYear | genre    |
      | Workflow Book  | Workflow Auth | 978-7777777777| 2020          | Fiction  |
    And I store the book ID from the response
    When I send a GET request to "/api/books/<storedBookId>"
    Then the response status should be 200
    And the book "title" should be "Workflow Book"
    When I send a PUT request to "/api/books/<storedBookId>" with the following data:
      | title          | author        | isbn          | publishedYear | genre    |
      | Updated Workflow| Updated Auth  | 978-7777777777| 2021          | Mystery  |
    Then the response status should be 200
    And the book "title" should be "Updated Workflow"
    When I send a DELETE request to "/api/books/<storedBookId>"
    Then the response status should be 200
    When I send a GET request to "/api/books/<storedBookId>"
    Then the response status should be 404
