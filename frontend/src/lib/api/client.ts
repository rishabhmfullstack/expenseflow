import axios from 'axios';
import { API_BASE_URL } from './constants';
import { attachAuthRequestInterceptor, attachAuthResponseInterceptor } from './interceptors/auth.interceptor';
import { attachErrorResponseInterceptor } from './interceptors/error.interceptor';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

attachAuthRequestInterceptor(api);
attachErrorResponseInterceptor(api);
attachAuthResponseInterceptor(api);
