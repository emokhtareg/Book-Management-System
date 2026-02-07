import { AxiosResponse, AxiosInstance } from 'axios';

// Shared context for all step definitions
export const context: {
  authToken?: string;
  baseUrl?: string;
  lastResponse?: AxiosResponse;
  storedBookId?: string;
  storedBookIds?: string[];
  axiosInstance?: AxiosInstance;
} = {};
