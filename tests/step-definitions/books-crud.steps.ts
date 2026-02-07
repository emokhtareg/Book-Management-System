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
  // Also check response headers directly
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

// Authentication steps
Given('I am authenticated as a user', async () => {
  // Ensure baseUrl is set, default to localhost:3000 if not set
  if (!context.baseUrl) {
    context.baseUrl = 'http://localhost:3000';
  }
  
  const axiosInstance = getAxiosInstance();
  const loginResponse = await axiosInstance.post(`${context.baseUrl}/api/auth/login`, {
    username: 'admin',
    password: 'admin',
  });

  // Extract token from cookie in response headers
  const token = extractCookie(loginResponse, 'token');
  if (token) {
    context.authToken = token;
  } else {
    // Fallback: try to extract from Set-Cookie header manually
    const setCookie = loginResponse.headers['set-cookie'];
    if (setCookie) {
      const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
      for (const cookie of cookies) {
        if (cookie.includes('token=')) {
          const match = cookie.match(/token=([^;]+)/);
          if (match) {
            context.authToken = match[1];
            break;
          }
        }
      }
    }
  }

  // Store the axios instance with cookies for subsequent requests
  if (context.authToken) {
    // Update axios instance default headers
    axiosInstance.defaults.headers.common['Cookie'] = `token=${context.authToken}`;
    
    // Also authenticate in the browser by performing login through UI
    // This ensures the cookie is set correctly for browser-based tests
    // Note: This is optional - if it fails, API calls will still work via axios
    try {
      // First, try to set cookie directly (faster and more reliable)
      await browser.url(context.baseUrl);
      await browser.pause(500);
      
      try {
        await browser.setCookies([{
          name: 'token',
          value: context.authToken,
          domain: 'localhost',
          path: '/',
          httpOnly: false, // Try without httpOnly first
          secure: false,
          sameSite: 'Lax'
        }]);
        
        // Verify cookie was set
        const cookies = await browser.getCookies();
        const tokenCookie = cookies.find(c => c.name === 'token');
        if (tokenCookie) {
          // Cookie set successfully, skip UI login
          return;
        }
      } catch (cookieError) {
        // Cookie setting failed, try UI login as fallback
      }
      
      // Fallback: Try UI login if cookie setting didn't work
      await browser.url(`${context.baseUrl}/login`);
      await browser.pause(2000); // Wait for page to load
      
      // Wait for login form to be present (with shorter timeout)
      const formExists = await browser.waitUntil(async () => {
        try {
          const form = await $('form');
          return await form.isExisting();
        } catch {
          return false;
        }
      }, { timeout: 5000, interval: 500 }).catch(() => false);
      
      if (formExists) {
        // Fill in login form - use more specific selectors
        const usernameInput = await $('input[placeholder="Enter username"]');
        const passwordInput = await $('input[type="password"]');
        const submitButton = await $('button[type="submit"]');
        
        if (await usernameInput.isExisting() && await passwordInput.isExisting() && await submitButton.isExisting()) {
          await usernameInput.setValue('admin');
          await passwordInput.setValue('admin');
          await submitButton.click();
          
          // Wait for redirect after login (with shorter timeout)
          await browser.waitUntil(async () => {
            try {
              const url = await browser.getUrl();
              return !url.includes('/login');
            } catch {
              return false;
            }
          }, { timeout: 5000, interval: 500 }).catch(() => {
            // Redirect timeout is OK - cookie might still be set
          });
        }
      }
    } catch (error) {
      // Silently continue - API calls will still work via axios
      // Browser authentication is optional for API-only tests
    }
  }
});

Given('I am not authenticated', async () => {
  context.authToken = undefined;
  // Clear axios instance to reset cookies
  if (context.axiosInstance) {
    delete context.axiosInstance.defaults.headers.common['Cookie'];
  }
  
  // Also clear browser cookies to ensure unauthenticated state
  try {
    const cookies = await browser.getCookies();
    const tokenCookie = cookies.find(c => c.name === 'token');
    if (tokenCookie) {
      await browser.deleteCookies('token');
    }
  } catch (error) {
    // Silently fail - browser might not be initialized yet
  }
});

Given('the API base URL is {string}', (url: string) => {
  context.baseUrl = url;
});

// Book creation steps
When('I send a POST request to {string} with the following data:', async (endpoint: string, dataTable: DataTable) => {
  // Use hashes() for multi-column tables (returns array of objects)
  // Check if table has more than 2 columns by looking at raw data
  const rawData = dataTable.raw();
  let data: Record<string, string>;
  
  if (rawData.length > 0 && rawData[0].length > 2) {
    // Multi-column table - use hashes()
    const rows = dataTable.hashes();
    data = rows.length > 0 ? rows[0] : {};
  } else {
    // 2-column table - use rowsHash()
    data = dataTable.rowsHash();
  }
  
  const url = endpoint.startsWith('http') ? endpoint : `${context.baseUrl}${endpoint}`;
  const axiosInstance = getAxiosInstance();

  try {
    context.lastResponse = await axiosInstance.post(url, data, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
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

Given('I have created a book with the following data:', async (dataTable: DataTable) => {
  // Use hashes() for multi-column tables
  const rawData = dataTable.raw();
  let data: Record<string, string>;
  
  if (rawData.length > 0 && rawData[0].length > 2) {
    // Multi-column table - use hashes()
    const rows = dataTable.hashes();
    data = rows.length > 0 ? rows[0] : {};
  } else {
    // 2-column table - use rowsHash()
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
    if (!context.storedBookIds) {
      context.storedBookIds = [];
    }
    context.storedBookIds.push(response.data.id);
  }
});

// Read steps
When('I send a GET request to {string}', async (endpoint: string) => {
  let url = endpoint.startsWith('http') ? endpoint : `${context.baseUrl}${endpoint}`;
  
  // Replace stored values in URL
  if (context.storedBookId) {
    url = url.replace('<storedBookId>', context.storedBookId);
  }

  const axiosInstance = getAxiosInstance();
  try {
    context.lastResponse = await axiosInstance.get(url, {
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

// Update steps
When('I send a PUT request to {string} with the following data:', async (endpoint: string, dataTable: DataTable) => {
  // Handle different table formats
  const rawData = dataTable.raw();
  let data: Record<string, string> = {};
  
  if (rawData.length === 0) {
    data = {};
  } else if (rawData[0].length > 2) {
    // Multi-column table (e.g., title | author | isbn | ...) - use hashes()
    const rows = dataTable.hashes();
    data = rows.length > 0 ? rows[0] : {};
  } else if (rawData[0].length === 2) {
    // 2-column table (key | value) - use rowsHash()
    try {
      data = dataTable.rowsHash();
    } catch (error) {
      // If rowsHash fails, try manual parsing
      for (let i = 0; i < rawData.length; i++) {
        if (rawData[i].length === 2) {
          data[rawData[i][0]] = rawData[i][1];
        }
      }
    }
  } else if (rawData[0].length === 1 && rawData.length >= 2) {
    // Single column table - treat as key-value pairs (first row is key, second is value)
    // This handles cases like: | title | \n | New Title Only |
    if (rawData.length >= 2) {
      data[rawData[0][0]] = rawData[1][0] || '';
    }
  }
  
  let url = endpoint.startsWith('http') ? endpoint : `${context.baseUrl}${endpoint}`;
  
  // Replace stored values in URL
  if (context.storedBookId) {
    url = url.replace('<storedBookId>', context.storedBookId);
  }

  const axiosInstance = getAxiosInstance();
  try {
    context.lastResponse = await axiosInstance.put(url, data, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
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

// Delete steps
When('I send a DELETE request to {string}', async (endpoint: string) => {
  let url = endpoint.startsWith('http') ? endpoint : `${context.baseUrl}${endpoint}`;
  
  // Replace stored values in URL
  if (context.storedBookId) {
    url = url.replace('<storedBookId>', context.storedBookId);
  }

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

// Storage steps
Given('I store the book ID from the response', () => {
  if (context.lastResponse?.data?.id) {
    context.storedBookId = context.lastResponse.data.id;
  } else {
    throw new Error('No book ID found in response');
  }
});

// Test setup/teardown steps
Given('I have cleared all books', async () => {
  const url = `${context.baseUrl}/api/books/reset`;
  const axiosInstance = getAxiosInstance();
  
  try {
    await axiosInstance.post(url, {}, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    // If reset endpoint doesn't exist or fails, continue anyway
    console.warn('Warning: Could not clear books via API');
  }
});

// Response assertion steps
Then('the response status should be {int}', (statusCode: number) => {
  expect(context.lastResponse?.status).toBe(statusCode);
});

Then('the response should contain a book object', () => {
  expect(context.lastResponse?.data).toBeDefined();
  expect(typeof context.lastResponse?.data).toBe('object');
  expect(Array.isArray(context.lastResponse?.data)).toBe(false);
});

Then('the response should be an array', () => {
  expect(Array.isArray(context.lastResponse?.data)).toBe(true);
});

Then('the response should contain an error message {string}', (expectedMessage: string) => {
  expect(context.lastResponse?.data?.error).toBe(expectedMessage);
});

Then('the response should contain a success message {string}', (expectedMessage: string) => {
  expect(context.lastResponse?.data?.message).toBe(expectedMessage);
});

Then('the book should have the following properties:', (dataTable: DataTable) => {
  const book = context.lastResponse?.data as Book;
  expect(book).toBeDefined();
  
  // Convert table rows to object, skipping header row if present
  const rawData = dataTable.raw();
  const expectedProps: Record<string, string> = {};
  
  // Skip first row if it's a header (contains "property" and "value")
  const startIndex = rawData.length > 0 && 
                     rawData[0].length === 2 && 
                     rawData[0][0].toLowerCase() === 'property' && 
                     rawData[0][1].toLowerCase() === 'value' ? 1 : 0;
  
  for (let i = startIndex; i < rawData.length; i++) {
    if (rawData[i].length === 2) {
      expectedProps[rawData[i][0]] = rawData[i][1];
    }
  }
  
  for (const [key, value] of Object.entries(expectedProps)) {
    if (key === 'publishedYear') {
      expect(book[key as keyof Book]).toBe(parseInt(value as string, 10));
    } else {
      expect(book[key as keyof Book]).toBe(value);
    }
  }
});

Then('the book should have an {string} property', (propertyName: string) => {
  const book = context.lastResponse?.data as Book;
  expect(book).toBeDefined();
  expect(book[propertyName as keyof Book]).toBeDefined();
});

Then('the book should have a {string} property', (propertyName: string) => {
  const book = context.lastResponse?.data as Book;
  expect(book).toBeDefined();
  expect(book[propertyName as keyof Book]).toBeDefined();
});

Then('the book {string} should be {string}', (propertyName: string, expectedValue: string) => {
  const book = context.lastResponse?.data as Book;
  expect(book).toBeDefined();
  expect(book[propertyName as keyof Book]).toBe(expectedValue);
});

Then('the book {string} should match {string}', (propertyName: string, expectedValue: string) => {
  const book = context.lastResponse?.data as Book;
  expect(book).toBeDefined();
  let actualValue = book[propertyName as keyof Book];
  
  // Replace stored values in expected value
  let expected = expectedValue;
  if (context.storedBookId) {
    expected = expected.replace('<storedBookId>', context.storedBookId);
  }
  
  expect(String(actualValue)).toBe(expected);
});

Then('the array should contain at least {int} books', (minCount: number) => {
  const books = context.lastResponse?.data as Book[];
  expect(Array.isArray(books)).toBe(true);
  expect(books.length).toBeGreaterThanOrEqual(minCount);
});

Then('each book in the array should have the following properties:', (dataTable: DataTable) => {
  const books = context.lastResponse?.data as Book[];
  expect(Array.isArray(books)).toBe(true);
  
  // Extract property names, skipping header row if present
  const rawData = dataTable.raw();
  const requiredProps: string[] = [];
  
  // Skip first row if it's a header (contains "property")
  const startIndex = rawData.length > 0 && 
                     rawData[0].length > 0 && 
                     rawData[0][0].toLowerCase() === 'property' ? 1 : 0;
  
  for (let i = startIndex; i < rawData.length; i++) {
    if (rawData[i].length > 0 && rawData[i][0]) {
      requiredProps.push(rawData[i][0]);
    }
  }
  
  for (let i = 0; i < books.length; i++) {
    const book = books[i];
    for (const prop of requiredProps) {
      // Check if property exists in the object
      if (!(prop in book)) {
        throw new Error(
          `Book at index ${i} (id: ${book.id || 'unknown'}, title: ${book.title || 'unknown'}) ` +
          `is missing required property "${prop}". ` +
          `Available properties: ${Object.keys(book).join(', ')}`
        );
      }
      const value = book[prop as keyof Book];
      if (value === undefined || value === null) {
        throw new Error(
          `Book at index ${i} (id: ${book.id || 'unknown'}, title: ${book.title || 'unknown'}) ` +
          `has property "${prop}" but it is ${value === undefined ? 'undefined' : 'null'}. ` +
          `Available properties: ${Object.keys(book).join(', ')}`
        );
      }
      expect(value).toBeDefined();
    }
  }
});
