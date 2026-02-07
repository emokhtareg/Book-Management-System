import { Given, When, Then } from '@wdio/cucumber-framework';
import { expect } from '@wdio/globals';
import axios, { AxiosResponse, AxiosInstance, AxiosError } from 'axios';
import { Book } from '../../types/index';
import type { DataTable } from '@cucumber/cucumber';
import { context } from '../support/context';

// Create axios instance with cookie support
function getAxiosInstance(): AxiosInstance {
  if (!context.axiosInstance) {
    context.axiosInstance = axios.create({
      withCredentials: true,
      validateStatus: () => true, // Don't throw on any status
    });
  }
  return context.axiosInstance;
}

// Helper function to get auth cookie header
function getAuthHeaders(): { Cookie?: string } {
  if (context.authToken) {
    return {
      Cookie: `token=${context.authToken}`,
    };
  }
  return {};
}

// Helper function to extract cookie from response headers
function extractCookie(response: AxiosResponse, cookieName: string): string | undefined {
  const setCookieHeader = response.headers['set-cookie'];
  if (setCookieHeader) {
    const cookies = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
    for (const cookie of cookies) {
      if (cookie.startsWith(`${cookieName}=`)) {
        return cookie.split(';')[0].split('=')[1];
      }
    }
  }
  const cookieHeader = response.headers['cookie'] || response.headers['Cookie'];
  if (cookieHeader) {
    const cookies = cookieHeader.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === cookieName) {
        return value;
      }
    }
  }
  return undefined;
}

// Navigation steps
// Note: Authentication and book creation steps are defined in books-crud.steps.ts
Given('I have navigated to the reports page', async () => {
  // Ensure we're on the base URL first to establish domain context
  if (!context.baseUrl) {
    context.baseUrl = 'http://localhost:3000';
  }
  await browser.url(context.baseUrl);
  await browser.pause(500); // Small pause to ensure page is ready
  
  // Navigate to reports page
  await browser.url('/reports');
  
  // Wait for URL to be correct (or redirected to login if not authenticated)
  await browser.waitUntil(async () => {
    const url = await browser.getUrl();
    return url.includes('/reports') || url.includes('/login');
  }, { timeout: 15000 });
  
  // Check current URL
  const currentUrl = await browser.getUrl();
  if (currentUrl.includes('/login')) {
    // Debug: check if cookie exists
    const cookies = await browser.getCookies();
    const tokenCookie = cookies.find(c => c.name === 'token');
    throw new Error(
      `User was redirected to login page - authentication may have failed. ` +
      `Current URL: ${currentUrl}. ` +
      `Token cookie exists: ${tokenCookie ? 'yes' : 'no'}. ` +
      `Cookies: ${JSON.stringify(cookies.map(c => c.name))}`
    );
  }
  
  // Wait for ProtectedRoute loading spinner to disappear (if it exists)
  // The spinner might not exist if page loads quickly, so we check for either:
  // 1. Spinner doesn't exist, OR
  // 2. Spinner exists but is not displayed
  await browser.waitUntil(async () => {
    const spinner = await $('.spinner-border');
    const spinnerExists = await spinner.isExisting();
    if (!spinnerExists) {
      return true; // No spinner means page is loaded
    }
    // If spinner exists, check if it's displayed
    try {
      const isDisplayed = await spinner.isDisplayed();
      return !isDisplayed;
    } catch (e) {
      return true; // If we can't check, assume it's gone
    }
  }, { timeout: 15000, timeoutMsg: 'ProtectedRoute loading spinner did not disappear' });
  
  // Wait for the page to load by checking for the h1 element
  await browser.waitUntil(async () => {
    const h1Element = await $('h1');
    const exists = await h1Element.isExisting();
    if (exists) {
      try {
        const text = await h1Element.getText();
        return text === 'Reports';
      } catch (e) {
        return false;
      }
    }
    return false;
  }, { 
    timeout: 15000, 
    timeoutMsg: `Reports page did not load - h1 element not found. Current URL: ${await browser.getUrl()}. Page title: ${await browser.getTitle()}`
  });
});

When('I navigate to the reports page', async () => {
  await browser.url('/reports');
  // Wait for URL to be correct (or redirected to login if not authenticated)
  await browser.waitUntil(async () => {
    const url = await browser.getUrl();
    return url.includes('/reports') || url.includes('/login');
  }, { timeout: 10000 });
  
  // If redirected to login, that's an error for authenticated scenarios
  const currentUrl = await browser.getUrl();
  if (currentUrl.includes('/login')) {
    throw new Error('User was redirected to login page - authentication may have failed');
  }
  
  // Wait for ProtectedRoute loading spinner to disappear (if it exists)
  // The spinner might not exist if page loads quickly, so we check for either:
  // 1. Spinner doesn't exist, OR
  // 2. Spinner exists but is not displayed
  await browser.waitUntil(async () => {
    const spinner = await $('.spinner-border');
    const spinnerExists = await spinner.isExisting();
    if (!spinnerExists) {
      return true; // No spinner means page is loaded
    }
    // If spinner exists, check if it's displayed
    try {
      const isDisplayed = await spinner.isDisplayed();
      return !isDisplayed;
    } catch (e) {
      return true; // If we can't check, assume it's gone
    }
  }, { timeout: 10000, timeoutMsg: 'ProtectedRoute loading spinner did not disappear' });
  
  // Wait for the page to load by checking for the h1 element
  await browser.waitUntil(async () => {
    const h1Element = await $('h1');
    const exists = await h1Element.isExisting();
    if (exists) {
      try {
        const text = await h1Element.getText();
        return text === 'Reports';
      } catch (e) {
        return false;
      }
    }
    return false;
  }, { timeout: 10000, timeoutMsg: 'Reports page did not load - h1 element not found' });
});

When('I try to navigate to the reports page', async () => {
  await browser.url('/reports');
  // Wait a bit for the page to start loading and ProtectedRoute to check auth
  await browser.pause(1000);
});

When('I refresh the reports page', async () => {
  await browser.refresh();
  await browser.pause(1000); // Wait for page to reload
});

// Page title verification
Then('I should see the reports page title {string}', async (expectedTitle: string) => {
  // Wait for the h1 element to be present and have the correct text
  await browser.waitUntil(async () => {
    const h1Element = await $('h1');
    const exists = await h1Element.isExisting();
    if (exists) {
      try {
        const text = await h1Element.getText();
        return text === expectedTitle;
      } catch (e) {
        return false;
      }
    }
    return false;
  }, { timeout: 10000, timeoutMsg: `Expected to find h1 with text "${expectedTitle}"` });
  
  const h1Element = await $('h1');
  const actualTitle = await h1Element.getText();
  expect(actualTitle).toBe(expectedTitle);
});

// Total books count verification
Then('the total books count should be {int}', async (expectedCount: number) => {
  // Wait for the stats to load - look for h2 element that contains a number
  await browser.waitUntil(async () => {
    const h2Elements = await $$('h2');
    for (const h2 of h2Elements) {
      const text = await h2.getText();
      const num = parseInt(text, 10);
      if (!isNaN(num)) {
        // Check if it's in a card with "Total Books" title
        const parent = await h2.$('..');
        const parentText = await parent.getText();
        if (parentText.includes('Total Books')) {
          return true;
        }
      }
    }
    return false;
  }, { timeout: 10000 });

  // Find the h2 element in the Total Books card
  const cards = await $$('.card');
  for (const card of cards) {
    const cardText = await card.getText();
    if (cardText.includes('Total Books')) {
      const h2 = await card.$('h2');
      if (await h2.isExisting()) {
        const countText = await h2.getText();
        const actualCount = parseInt(countText, 10);
        expect(actualCount).toBe(expectedCount);
        return;
      }
    }
  }
  throw new Error('Total Books card not found');
});

// Books by genre table verification
Then('the books by genre table should be empty', async () => {
  const cards = await $$('.card');
  for (const card of cards) {
    const cardText = await card.getText();
    if (cardText.includes('Books by Genre')) {
      const table = await card.$('table');
      if (await table.isExisting()) {
        const tbody = await table.$('tbody');
        if (await tbody.isExisting()) {
          const rows = await tbody.$$('tr');
          expect(rows.length).toBe(0);
          return;
        }
      }
    }
  }
});

Then('the books by genre table should contain:', async (dataTable: DataTable) => {
  await browser.waitUntil(async () => {
    const cards = await $$('.card');
    for (const card of cards) {
      const cardText = await card.getText();
      if (cardText.includes('Books by Genre')) {
        const table = await card.$('table');
        if (await table.isExisting()) {
          return true;
        }
      }
    }
    return false;
  }, { timeout: 10000 });

  const cards = await $$('.card');
  let table: WebdriverIO.Element | undefined;
  for (const card of cards) {
    const cardText = await card.getText();
    if (cardText.includes('Books by Genre')) {
      table = await card.$('table');
      break;
    }
  }
  
  if (!table) {
    throw new Error('Books by Genre table not found');
  }
  
  const tbody = await table.$('tbody');
  const rows = await tbody.$$('tr');

  const rawData = dataTable.raw();
  const startIndex = rawData.length > 0 && rawData[0][0].toLowerCase() === 'genre' ? 1 : 0;
  const expectedData: Record<string, number> = {};

  for (let i = startIndex; i < rawData.length; i++) {
    if (rawData[i].length >= 2) {
      expectedData[rawData[i][0]] = parseInt(rawData[i][1], 10);
    }
  }

  const actualData: Record<string, number> = {};
  for (const row of rows) {
    const cells = await row.$$('td');
    if (cells.length >= 2) {
      const genre = await cells[0].getText();
      const count = await cells[1].getText();
      actualData[genre] = parseInt(count, 10);
    }
  }

  for (const [genre, expectedCount] of Object.entries(expectedData)) {
    expect(actualData[genre]).toBe(expectedCount);
  }
});

// Books by year table verification
Then('the books by year table should be empty', async () => {
  const cards = await $$('.card');
  for (const card of cards) {
    const cardText = await card.getText();
    if (cardText.includes('Books by Year')) {
      const table = await card.$('table');
      if (await table.isExisting()) {
        const tbody = await table.$('tbody');
        if (await tbody.isExisting()) {
          const rows = await tbody.$$('tr');
          expect(rows.length).toBe(0);
          return;
        }
      }
    }
  }
});

Then('the books by year table should contain:', async (dataTable: DataTable) => {
  await browser.waitUntil(async () => {
    const cards = await $$('.card');
    for (const card of cards) {
      const cardText = await card.getText();
      if (cardText.includes('Books by Year')) {
        const table = await card.$('table');
        if (await table.isExisting()) {
          return true;
        }
      }
    }
    return false;
  }, { timeout: 10000 });

  const cards = await $$('.card');
  let table: WebdriverIO.Element | undefined;
  for (const card of cards) {
    const cardText = await card.getText();
    if (cardText.includes('Books by Year')) {
      table = await card.$('table');
      break;
    }
  }
  
  if (!table) {
    throw new Error('Books by Year table not found');
  }
  
  const tbody = await table.$('tbody');
  const rows = await tbody.$$('tr');

  const rawData = dataTable.raw();
  const startIndex = rawData.length > 0 && rawData[0][0].toLowerCase() === 'year' ? 1 : 0;
  const expectedData: Record<string, number> = {};

  for (let i = startIndex; i < rawData.length; i++) {
    if (rawData[i].length >= 2) {
      expectedData[rawData[i][0]] = parseInt(rawData[i][1], 10);
    }
  }

  const actualData: Record<string, number> = {};
  for (const row of rows) {
    const cells = await row.$$('td');
    if (cells.length >= 2) {
      const year = await cells[0].getText();
      const count = await cells[1].getText();
      actualData[year] = parseInt(count, 10);
    }
  }

  for (const [year, expectedCount] of Object.entries(expectedData)) {
    expect(actualData[year]).toBe(expectedCount);
  }
});

Then('the books by year table should be sorted in descending order by year', async () => {
  const cards = await $$('.card');
  let table: WebdriverIO.Element | undefined;
  for (const card of cards) {
    const cardText = await card.getText();
    if (cardText.includes('Books by Year')) {
      table = await card.$('table');
      break;
    }
  }
  
  if (!table) {
    throw new Error('Books by Year table not found');
  }
  
  const tbody = await table.$('tbody');
  const rows = await tbody.$$('tr');

  const years: number[] = [];
  for (const row of rows) {
    const cells = await row.$$('td');
    if (cells.length > 0) {
      const yearText = await cells[0].getText();
      years.push(parseInt(yearText, 10));
    }
  }

  for (let i = 0; i < years.length - 1; i++) {
    expect(years[i]).toBeGreaterThanOrEqual(years[i + 1]);
  }
});

Then('the first year in the books by year table should be {int}', async (expectedYear: number) => {
  const cards = await $$('.card');
  let table: WebdriverIO.Element | undefined;
  for (const card of cards) {
    const cardText = await card.getText();
    if (cardText.includes('Books by Year')) {
      table = await card.$('table');
      break;
    }
  }
  
  if (!table) {
    throw new Error('Books by Year table not found');
  }
  
  const tbody = await table.$('tbody');
  const firstRow = await tbody.$('tr');
  const firstCell = await firstRow.$('td');
  const yearText = await firstCell.getText();
  expect(parseInt(yearText, 10)).toBe(expectedYear);
});

Then('the last year in the books by year table should be {int}', async (expectedYear: number) => {
  const cards = await $$('.card');
  let table: WebdriverIO.Element | undefined;
  for (const card of cards) {
    const cardText = await card.getText();
    if (cardText.includes('Books by Year')) {
      table = await card.$('table');
      break;
    }
  }
  
  if (!table) {
    throw new Error('Books by Year table not found');
  }
  
  const tbody = await table.$('tbody');
  const rows = await tbody.$$('tr');
  const lastRow = rows[rows.length - 1];
  const firstCell = await lastRow.$('td');
  const yearText = await firstCell.getText();
  expect(parseInt(yearText, 10)).toBe(expectedYear);
});

// All books table verification
Then('the all books table should be empty', async () => {
  await browser.waitUntil(async () => {
    const cards = await $$('.card');
    for (const card of cards) {
      const cardText = await card.getText();
      if (cardText.includes('All Books')) {
        const table = await card.$('table');
        if (await table.isExisting()) {
          return true;
        }
      }
    }
    return false;
  }, { timeout: 10000 });

  const cards = await $$('.card');
  for (const card of cards) {
    const cardText = await card.getText();
    if (cardText.includes('All Books')) {
      const table = await card.$('table');
      const tbody = await table.$('tbody');
      if (await tbody.isExisting()) {
        const rows = await tbody.$$('tr');
        expect(rows.length).toBe(0);
        return;
      }
    }
  }
});

Then('the all books table should contain {int} book', async (expectedCount: number) => {
  await shouldContainBooks(expectedCount);
});

Then('the all books table should contain {int} books', async (expectedCount: number) => {
  await shouldContainBooks(expectedCount);
});

// Helper method for book count
async function shouldContainBooks(expectedCount: number) {
  await browser.waitUntil(async () => {
    const cards = await $$('.card');
    for (const card of cards) {
      const cardText = await card.getText();
      if (cardText.includes('All Books')) {
        const table = await card.$('table');
        if (await table.isExisting()) {
          return true;
        }
      }
    }
    return false;
  }, { timeout: 10000 });

  const cards = await $$('.card');
  for (const card of cards) {
    const cardText = await card.getText();
    if (cardText.includes('All Books')) {
      const table = await card.$('table');
      const tbody = await table.$('tbody');
      const rows = await tbody.$$('tr');
      expect(rows.length).toBe(expectedCount);
      return;
    }
  }
  throw new Error('All Books table not found');
}

Then('the all books table should display the book {string}', async (expectedTitle: string) => {
  const cards = await $$('.card');
  let table: WebdriverIO.Element | undefined;
  for (const card of cards) {
    const cardText = await card.getText();
    if (cardText.includes('All Books')) {
      table = await card.$('table');
      break;
    }
  }
  
  if (!table) {
    throw new Error('All Books table not found');
  }
  
  const tbody = await table.$('tbody');
  const rows = await tbody.$$('tr');

  let found = false;
  for (const row of rows) {
    const cells = await row.$$('td');
    if (cells.length > 0) {
      const title = await cells[0].getText();
      if (title === expectedTitle) {
        found = true;
        break;
      }
    }
  }
  expect(found).toBe(true);
});

Then('the all books table should have the following column headers:', async (dataTable: DataTable) => {
  const cards = await $$('.card');
  let table: WebdriverIO.Element | undefined;
  for (const card of cards) {
    const cardText = await card.getText();
    if (cardText.includes('All Books')) {
      table = await card.$('table');
      break;
    }
  }
  
  if (!table) {
    throw new Error('All Books table not found');
  }
  
  const thead = await table.$('thead');
  const headerRow = await thead.$('tr');
  const headerCells = await headerRow.$$('th');

  const rawData = dataTable.raw();
  const expectedHeaders: string[] = [];
  for (const row of rawData) {
    if (row.length > 0) {
      expectedHeaders.push(row[0]);
    }
  }

  expect(headerCells.length).toBe(expectedHeaders.length);
  for (let i = 0; i < expectedHeaders.length; i++) {
    const headerText = await headerCells[i].getText();
    expect(headerText).toBe(expectedHeaders[i]);
  }
});

Then('the all books table should display book details:', async (dataTable: DataTable) => {
  const cards = await $$('.card');
  let table: WebdriverIO.Element | undefined;
  for (const card of cards) {
    const cardText = await card.getText();
    if (cardText.includes('All Books')) {
      table = await card.$('table');
      break;
    }
  }
  
  if (!table) {
    throw new Error('All Books table not found');
  }
  
  const tbody = await table.$('tbody');
  const rows = await tbody.$$('tr');

  const rawData = dataTable.raw();
  const startIndex = rawData.length > 0 && rawData[0][0].toLowerCase() === 'title' ? 1 : 0;
  const expectedBook = rawData[startIndex];

  expect(rows.length).toBeGreaterThan(0);
  const firstRow = rows[0];
  const cells = await firstRow.$$('td');

  expect(await cells[0].getText()).toBe(expectedBook[0]); // title
  expect(await cells[1].getText()).toBe(expectedBook[1]); // author
  expect(await cells[2].getText()).toBe(expectedBook[2]); // isbn
  expect(await cells[3].getText()).toBe(expectedBook[3]); // publishedYear
  expect(await cells[4].getText()).toBe(expectedBook[4]); // genre
});

// Book creation via UI
When('I create a new book with the following data:', async (dataTable: DataTable) => {
  const rawData = dataTable.raw();
  let data: Record<string, string>;
  
  if (rawData.length > 0 && rawData[0].length > 2) {
    const rows = dataTable.hashes();
    data = rows.length > 0 ? rows[0] : {};
  } else {
    data = dataTable.rowsHash();
  }

  const url = `${context.baseUrl}/api/books`;
  const axiosInstance = getAxiosInstance();

  const response = await axiosInstance.post(url, data, {
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
  });

  context.lastResponse = response;
  if (response.status === 201 && response.data?.id) {
    context.storedBookId = response.data.id;
  }
});

// Book deletion
When('I delete the book with ID {string}', async (bookId: string) => {
  let id = bookId;
  if (context.storedBookId && id.includes('<storedBookId>')) {
    id = id.replace('<storedBookId>', context.storedBookId);
  }

  const url = `${context.baseUrl}/api/books/${id}`;
  const axiosInstance = getAxiosInstance();

  try {
    context.lastResponse = await axiosInstance.delete(url, {
      headers: {
        ...getAuthHeaders(),
      },
    });
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    if (axiosError.response) {
      context.lastResponse = axiosError.response;
    } else {
      throw error;
    }
  }
});

// Redirect verification
Then('I should be redirected to the login page', async () => {
  // Wait for redirect to login page
  // ProtectedRoute needs time to check auth and redirect
  await browser.waitUntil(async () => {
    try {
      const url = await browser.getUrl();
      return url.includes('/login');
    } catch (e) {
      return false;
    }
  }, { 
    timeout: 15000, // Increased timeout to allow for auth check and redirect
    interval: 500,
    timeoutMsg: 'Expected to be redirected to login page but URL did not change'
  });
  
  // Verify we're on the login page
  const url = await browser.getUrl();
  expect(url).toContain('/login');
  
  // Also verify login form is present
  await browser.waitUntil(async () => {
    try {
      const form = await $('form');
      return await form.isExisting();
    } catch (e) {
      return false;
    }
  }, { timeout: 5000, timeoutMsg: 'Login form not found on login page' });
});
