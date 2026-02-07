Feature: Reports Page
  As a user
  I want to view reports and statistics about books
  So that I can analyze my book collection

  Background:
    Given the API base URL is "http://localhost:3000"
    And I am authenticated as a user

  Scenario: View reports page with empty book collection
    Given I have cleared all books
    And I have navigated to the reports page
    Then I should see the reports page title "Reports"
    And the total books count should be 0
    And the books by genre table should be empty
    And the books by year table should be empty
    And the all books table should be empty

  Scenario: View reports page with single book
    Given I have created a book with the following data:
      | title          | author        | isbn          | publishedYear | genre    |
      | Single Book     | Single Author | 978-1111111111| 2020          | Fiction  |
    When I navigate to the reports page
    Then I should see the reports page title "Reports"
    And the total books count should be 1
    And the books by genre table should contain:
      | genre   | count |
      | Fiction | 1     |
    And the books by year table should contain:
      | year | count |
      | 2020 | 1     |
    And the all books table should contain 1 book
    And the all books table should display the book "Single Book"

  Scenario: View reports page with multiple books of different genres
    Given I have created a book with the following data:
      | title          | author        | isbn          | publishedYear | genre    |
      | Fiction Book 1 | Author One    | 978-2222222222| 2020          | Fiction  |
    And I have created a book with the following data:
      | title          | author        | isbn          | publishedYear | genre    |
      | Fiction Book 2 | Author Two    | 978-3333333333| 2021          | Fiction  |
    And I have created a book with the following data:
      | title          | author        | isbn          | publishedYear | genre    |
      | Mystery Book   | Author Three  | 978-4444444444| 2022          | Mystery  |
    When I navigate to the reports page
    Then I should see the reports page title "Reports"
    And the total books count should be 3
    And the books by genre table should contain:
      | genre   | count |
      | Fiction | 2     |
      | Mystery | 1     |
    And the books by year table should contain:
      | year | count |
      | 2020 | 1     |
      | 2021 | 1     |
      | 2022 | 1     |
    And the all books table should contain 3 books

  Scenario: View reports page with multiple books of same genre
    Given I have created a book with the following data:
      | title          | author        | isbn          | publishedYear | genre    |
      | Sci-Fi Book 1  | Author One    | 978-5555555555| 2020          | Sci-Fi   |
    And I have created a book with the following data:
      | title          | author        | isbn          | publishedYear | genre    |
      | Sci-Fi Book 2  | Author Two    | 978-6666666666| 2021          | Sci-Fi   |
    And I have created a book with the following data:
      | title          | author        | isbn          | publishedYear | genre    |
      | Sci-Fi Book 3  | Author Three  | 978-7777777777| 2022          | Sci-Fi   |
    When I navigate to the reports page
    Then I should see the reports page title "Reports"
    And the total books count should be 3
    And the books by genre table should contain:
      | genre  | count |
      | Sci-Fi | 3     |
    And the books by year table should contain:
      | year | count |
      | 2020 | 1     |
      | 2021 | 1     |
      | 2022 | 1     |

  Scenario: View reports page with multiple books of same year
    Given I have created a book with the following data:
      | title          | author        | isbn          | publishedYear | genre    |
      | Book 2023 A    | Author One    | 978-8888888888| 2023          | Fiction  |
    And I have created a book with the following data:
      | title          | author        | isbn          | publishedYear | genre    |
      | Book 2023 B    | Author Two    | 978-9999999999| 2023          | Mystery  |
    And I have created a book with the following data:
      | title          | author        | isbn          | publishedYear | genre    |
      | Book 2023 C    | Author Three  | 978-1010101010| 2023          | Sci-Fi   |
    When I navigate to the reports page
    Then I should see the reports page title "Reports"
    And the total books count should be 3
    And the books by year table should contain:
      | year | count |
      | 2023 | 3     |
    And the books by genre table should contain:
      | genre   | count |
      | Fiction | 1     |
      | Mystery | 1     |
      | Sci-Fi  | 1     |

  Scenario: Reports page updates after creating a new book
    Given I have created a book with the following data:
      | title          | author        | isbn          | publishedYear | genre    |
      | Initial Book   | Initial Author | 978-1212121212| 2020          | Fiction  |
    And I have navigated to the reports page
    And the total books count should be 1
    When I create a new book with the following data:
      | title          | author        | isbn          | publishedYear | genre    |
      | New Book       | New Author    | 978-1313131313| 2021          | Mystery  |
    And I refresh the reports page
    Then the total books count should be 2
    And the books by genre table should contain:
      | genre   | count |
      | Fiction | 1     |
      | Mystery | 1     |
    And the all books table should contain 2 books

  Scenario: Reports page updates after deleting a book
    Given I have created a book with the following data:
      | title          | author        | isbn          | publishedYear | genre    |
      | Book To Keep   | Author Keep   | 978-1414141414| 2020          | Fiction  |
    And I have created a book with the following data:
      | title          | author        | isbn          | publishedYear | genre    |
      | Book To Delete | Author Delete | 978-1515151515| 2021          | Mystery  |
    And I store the book ID from the response
    And I have navigated to the reports page
    And the total books count should be 2
    When I delete the book with ID "<storedBookId>"
    And I refresh the reports page
    Then the total books count should be 1
    And the books by genre table should contain:
      | genre   | count |
      | Fiction | 1     |
    And the books by year table should contain:
      | year | count |
      | 2020 | 1     |
    And the all books table should contain 1 book

  Scenario: Access reports page without authentication
    Given I am not authenticated
    When I try to navigate to the reports page
    Then I should be redirected to the login page

  Scenario: Verify all books table displays correct columns
    Given I have created a book with the following data:
      | title          | author        | isbn          | publishedYear | genre    |
      | Test Book      | Test Author   | 978-1616161616| 2020          | Fiction  |
    When I navigate to the reports page
    Then the all books table should have the following column headers:
      | Title           |
      | Author          |
      | ISBN            |
      | Published Year  |
      | Genre           |
    And the all books table should display book details:
      | title     | author      | isbn          | publishedYear | genre   |
      | Test Book | Test Author | 978-1616161616| 2020          | Fiction |

  Scenario: Verify books by year table is sorted correctly
    Given I have created a book with the following data:
      | title          | author        | isbn          | publishedYear | genre    |
      | Old Book       | Old Author    | 978-1717171717| 2018          | Fiction  |
    And I have created a book with the following data:
      | title          | author        | isbn          | publishedYear | genre    |
      | Recent Book    | Recent Author | 978-1818181818| 2023          | Fiction  |
    And I have created a book with the following data:
      | title          | author        | isbn          | publishedYear | genre    |
      | Middle Book    | Middle Author | 978-1919191919| 2020          | Fiction  |
    When I navigate to the reports page
    Then the books by year table should be sorted in descending order by year
    And the first year in the books by year table should be 2023
    And the last year in the books by year table should be 2018
