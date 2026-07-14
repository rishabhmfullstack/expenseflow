import type { InternalAxiosRequestConfig } from 'axios';

export interface ApiRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  skipAuthRefresh?: boolean;
}
